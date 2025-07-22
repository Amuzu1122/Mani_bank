from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics, status
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .models import User, Account, Transaction
from .serializers import UserDashboardSerializer, TransactionSerializer
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from django.db.models import Q
from django.contrib.auth import authenticate

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        password = request.data.get('password')

        if not all([email, username, first_name, last_name, password]):
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                password=password
            )
            return Response(
                {"message": "User registered successfully. Please verify your email."},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = authenticate(request, email=email, password=password)
        if not user:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if not user.is_email_verified:
            return Response(
                {
                    "error": "Email verification required to log in.",
                    "action_required": "Please verify your email via the link sent to your inbox."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_email_verified": user.is_email_verified
            }
        }, status=status.HTTP_200_OK)

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_email_verified:
            return Response(
                {
                    "error": "Email verification required to access dashboard.",
                    "action_required": "Please verify your email via the link sent to your inbox."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            serializer = UserDashboardSerializer(user, context={'request': request})
            response_data = serializer.data
            account = user.account
            if account.status != 'active':
                response_data['account_status_message'] = (
                    f"Your account is {account.status}. "
                    f"{'Contact support to reactivate.' if account.status == 'frozen' else 'This account cannot perform transactions.'}"
                )
            return Response(response_data)
        except ObjectDoesNotExist:
            return Response(
                {"error": "No account associated with this user."},
                status=status.HTTP_404_NOT_FOUND
            )

class TransactionCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def perform_create(self, serializer):
        try:
            account = self.request.user.account
            if not self.request.user.is_email_verified:
                raise PermissionDenied("Email verification required to create transactions.")
            if account.status != 'active':
                raise PermissionDenied(f"Cannot create transactions for a {account.status} account.")
            serializer.save(account=account, created_by=self.request.user)
        except ObjectDoesNotExist:
            raise NotFound("User account not found.")

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class TransactionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        try:
            user = self.request.user
            if not user.is_email_verified:
                raise PermissionDenied("Email verification required to view transactions.")
            account = user.account
            if account.status != 'active':
                raise PermissionDenied(f"Cannot view transactions for a {account.status} account.")
            
            queryset = account.transactions.all()
            
            transaction_type = self.request.query_params.get('type')
            status = self.request.query_params.get('status')
            date_from = self.request.query_params.get('date_from')
            date_to = self.request.query_params.get('date_to')
            search = self.request.query_params.get('search')
            
            if transaction_type:
                queryset = queryset.filter(transaction_type=transaction_type)
            if status:
                queryset = queryset.filter(status=status)
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            if search:
                queryset = queryset.filter(
                    Q(description__icontains=search) |
                    Q(amount__icontains=search)
                )
            
            return queryset.order_by('-date')
        except ObjectDoesNotExist:
            raise NotFound("User account not found.")

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

class VerifyEmailView(APIView):
    permission_classes = []

    def get(self, request, token):
        try:
            user = User.objects.get(email_verification_token=token)
            if user.is_email_verified:
                return Response(
                    {"message": "Email already verified."},
                    status=status.HTTP_200_OK
                )
            if user.email_verification_token_expires < now():
                return Response(
                    {"error": "Verification link has expired."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.is_email_verified = True
            user.email_verification_token = None
            user.email_verification_token_expires = None
            user.save()
            return Response(
                {"message": "Email verified successfully."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_transaction(request, transaction_id):
    tx = get_object_or_404(Transaction, id=transaction_id)

    if tx.status != 'pending':
        return Response({'error': 'Transaction already processed.'}, status=400)

    try:
        with db_transaction.atomic():
            if tx.transaction_type == 'deposit':
                tx.account.balance += tx.amount
            elif tx.transaction_type == 'withdrawal':
                if tx.account.balance < tx.amount:
                    return Response({'error': 'Insufficient funds for withdrawal.'}, status=400)
                tx.account.balance -= tx.amount
            elif tx.transaction_type == 'transfer':
                if not tx.recipient_account:
                    return Response({'error': 'Recipient account required.'}, status=400)
                if tx.account.balance < tx.amount:
                    return Response({'error': 'Insufficient funds for transfer.'}, status=400)
                tx.account.balance -= tx.amount
                tx.recipient_account.balance += tx.amount
                tx.recipient_account.save()

            tx.account.save()
            tx.status = 'completed'
            tx.save()
        return Response({'message': 'Transaction approved and completed.'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)