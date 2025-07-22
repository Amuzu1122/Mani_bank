from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string
from django.core.mail import send_mail
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils.crypto import get_random_string
from django.core.exceptions import ValidationError
import dns.resolver
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

# MODELS FOR MANI_BANKING ACCOUNTS
# USER MODEL

def validate_email_domain(email):
    domain = email.split('@')[1]
    try:
        dns.resolver.resolve(domain, 'MX')
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
        raise ValidationError("Invalid email domain. Please use a valid email address.")

def normalize_email(email):
    """Custom function to normalize email addresses."""
    return email.lower().strip()

class User(AbstractUser):
    email = models.EmailField(unique=True, validators=[validate_email_domain])
    # username is inherited from AbstractUser (CharField, max_length=150, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, blank=True, null=True)
    email_verification_token_expires = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def save(self, *args, **kwargs):
        self.email = normalize_email(self.email)  # Use custom normalize_email function
        # Auto-generate username if not provided
        if not self.username:
            self.username = self.email.split('@')[0] + str(random.randint(1000, 9999))
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# ACCOUNT MODEL

class Account(models.Model):
    ACCOUNT_TYPES = (
        ('savings', 'Savings'),
        ('checking', 'Checking'),
        ('credit', 'Credit'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('frozen', 'Frozen'),
        ('closed', 'Closed'),
    )
    
    def generate_account_number():
        # Generate a 12-digit account number (e.g., 123456789012)
        while True:
            account_number = ''.join(random.choices(string.digits, k=12))
            # Check for uniqueness
            if not Account.objects.filter(account_number=account_number).exists():
                return account_number
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    account_number = models.CharField(max_length=20, unique=True, default=generate_account_number)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default='savings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name}'s {self.account_type} - {self.balance}"

# TRANSACTION MODEL

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('payment', 'Payment'),
        ('fee', 'Fee'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    recipient_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='initiated_transactions')
    
    def clean(self):
        if self.amount <= 0:
            raise ValidationError("Amount must be positive")
        if self.transaction_type == 'withdrawal' and self.account.balance < self.amount:
            raise ValidationError("Insufficient balance")
        if self.transaction_type == 'transfer' and not self.recipient_account:
            raise ValidationError("Recipient account is required for transfers")
        if self.account.user.is_email_verified is False:
            raise ValidationError("User's email must be verified to perform transactions")
    
    def save(self, *args, **kwargs):
        self.clean()
        if self.status == 'completed':
            if self.transaction_type == 'deposit':
                self.account.balance += self.amount
            elif self.transaction_type == 'withdrawal':
                self.account.balance -= self.amount
            elif self.transaction_type == 'transfer':
                self.account.balance -= self.amount
                if self.recipient_account:
                    self.recipient_account.balance += self.amount
                    self.recipient_account.save()
            self.account.save()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.transaction_type} of {self.amount} on {self.date}"
    
    class Meta:
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['account']),
        ]

# Signal to send verification email on user creation
@receiver(post_save, sender=User)
def send_verification_email(sender, instance, created, **kwargs):
    if created and not instance.is_email_verified:
        # Generate a unique token and set expiration (24 hours)
        instance.email_verification_token = get_random_string(length=64)
        instance.email_verification_token_expires = timezone.now() + timedelta(hours=24)
        instance.save()
        # Send verification email
        verification_link = f"{settings.SITE_URL}/verify-email/{instance.email_verification_token}/"
        try:
            send_mail(
                subject='Verify Your Email Address',
                message=f'Please verify your email by clicking this link: {verification_link}\nThis link expires in 24 hours.',
                from_email='no-reply@manibanking.com',
                recipient_list=[instance.email],
                fail_silently=True,  # Prevent crashes on email failure
            )
        except Exception as e:
            # Log the error (in production, use proper logging)
            print(f"Failed to send verification email to {instance.email}: {e}")

# Signal to create account for new users
@receiver(post_save, sender=User)
def create_user_account(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'account'):
        Account.objects.create(user=instance)