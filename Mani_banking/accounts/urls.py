from django.urls import path
from accounts.views import LoginView,UserDashboardView, TransactionCreateView, TransactionListView, VerifyEmailView, approve_transaction

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('transactions/create/', TransactionCreateView.as_view(), name='transaction_create'),
    path('transactions/', TransactionListView.as_view(), name='transaction_list'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('transactions/<int:transaction_id>/approve/', approve_transaction, name='approve_transaction'),
]