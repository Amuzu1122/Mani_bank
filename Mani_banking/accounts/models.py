from django.db import models
from django.contrib.auth.models import BaseUserManager,PermissionsMixin,AbstractBaseUser
import random
import dns.resolver
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
    """Check if the email domain has valid MX records."""
    domain = email.split('@')[-1]
    try:
        dns.resolver.resolve(domain, 'MX')
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
        raise ValidationError("Invalid email domain. Please use a valid email address.")

def normalize_email(email):
    """Normalize email address (lowercase and trimmed)."""
    return email.strip().lower()

class UserManager(BaseUserManager):
    def create_user(self, email, username=None, first_name='', last_name='', password=None, **extra_fields):
        if not email:
            raise ValueError('Email field is required.')

        email = normalize_email(email)
        validate_email_domain(email)

        if not username:
            username = f"{email.split('@')[0]}{random.randint(1000, 9999)}"

        user = self.model(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username=None, first_name='', last_name='', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, first_name, last_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, null=True, blank=True)
    email_verification_token_expires = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def save(self, *args, **kwargs):
        self.email = normalize_email(self.email)
        if not self.username:
            self.username = f"{self.email.split('@')[0]}{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
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