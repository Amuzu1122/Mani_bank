from rest_framework import serializers
from .models import User, Account, Transaction
from django.utils.timezone import now

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'recipient_account', 'amount','account', 'description', 'transaction_type', 'status', 'date']
        read_only_fields = ['id', 'status','account','date']

    def validate(self, data):
        # Ensure only authenticated user's account can be used
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if data['account'].user != request.user:
                raise serializers.ValidationError("You can only create transactions for your own account.")
            # For transfers, ensure recipient_account exists and is not the same as the source account
            if data['transaction_type'] == 'transfer':
                if not data.get('recipient_account'):
                    raise serializers.ValidationError("Recipient account is required for transfers.")
                if data['recipient_account'] == data['account']:
                    raise serializers.ValidationError("Cannot transfer to the same account.")
        else:
            raise serializers.ValidationError("Authentication required.")
        return data

    def create(self, validated_data):
        # Set created_by to the authenticated user
        validated_data['created_by'] = self.context['request'].user
        transaction = Transaction.objects.create(**validated_data)
    
        return transaction

class AccountSerializer(serializers.ModelSerializer):
    transactions = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['account_number', 'account_type', 'balance', 'status', 'created_at', 'transactions']
        read_only_fields = ['account_number', 'balance', 'created_at', 'transactions']

    def get_transactions(self, obj):
        # Return the 10 most recent transactions, ordered by date descending
        recent_transactions = obj.transactions.order_by('-date')[:10]
        return TransactionSerializer(recent_transactions, many=True).data

class UserDashboardSerializer(serializers.ModelSerializer):
    account = AccountSerializer(many = True, read_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'is_email_verified', 'accounts', 'transactions']