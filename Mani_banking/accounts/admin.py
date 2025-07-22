from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Account, Transaction
from django.utils.timezone import now
from django.contrib import messages

# Inline for Account in UserAdmin
class AccountInline(admin.StackedInline):
    model = Account
    can_delete = False
    verbose_name_plural = 'Account'
    fields = ('account_number', 'account_type', 'balance', 'status', 'created_at', 'updated_at')
    readonly_fields = ('account_number', 'balance', 'created_at', 'updated_at')
    extra = 0

# Inline for Transactions in AccountAdmin
class TransactionInline(admin.TabularInline):
    model = Transaction
    fk_name = 'account'  # Specify the ForeignKey to use for the inline
    fields = ('transaction_type', 'amount', 'recipient_account', 'status', 'date', 'created_by', 'description')
    readonly_fields = ('amount', 'recipient_account', 'status', 'date', 'created_by', 'description')
    extra = 0
    max_num = 10  # Limit to 10 transactions for performance
    can_delete = False

# Customize User admin
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_email_verified', 'is_staff', 'email_verification_status')
    list_filter = ('is_staff', 'is_superuser', 'is_email_verified', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = [AccountInline]

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Verification', {'fields': ('is_email_verified', 'email_verification_token', 'email_verification_token_expires')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 'address', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('email_verification_token', 'email_verification_token_expires')

    def email_verification_status(self, obj):
        if obj.is_email_verified:
            return "Verified"
        elif obj.email_verification_token_expires and obj.email_verification_token_expires < now():
            return "Expired"
        return "Pending"
    email_verification_status.short_description = "Verification Status"

    def get_readonly_fields(self, request, obj=None):
        # Prevent editing email for existing users to avoid verification bypass
        if obj:  # Editing an existing user
            return self.readonly_fields + ('email',)
        return self.readonly_fields

# Account admin with inline transactions
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'account_number', 'account_type', 'balance', 'status', 'created_at', 'updated_at')
    search_fields = ('user__email', 'account_number')
    list_filter = ('account_type', 'status', 'created_at')
    inlines = [TransactionInline]
    readonly_fields = ('account_number', 'balance', 'created_at', 'updated_at')

    actions = ['freeze_account', 'unfreeze_account']

    def freeze_account(self, request, queryset):
        updated = queryset.update(status='frozen')
        self.message_user(request, f"{updated} account(s) frozen successfully.", messages.SUCCESS)
    freeze_account.short_description = "Freeze selected accounts"

    def unfreeze_account(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f"{updated} account(s) unfrozen successfully.", messages.SUCCESS)
    unfreeze_account.short_description = "Unfreeze selected accounts"

    def get_readonly_fields(self, request, obj=None):
        # Prevent editing balance for existing accounts
        return self.readonly_fields

# Transaction admin
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('account', 'transaction_type', 'amount', 'recipient_account', 'status', 'date', 'created_by', 'description')
    list_filter = ('transaction_type', 'status', 'date', 'created_by')
    search_fields = ('description', 'account__account_number', 'created_by__email', 'recipient_account__account_number')
    readonly_fields = ('amount', 'account', 'recipient_account', 'transaction_type', 'date', 'created_by', 'description')

    actions = ['approve_transaction', 'reject_transaction']

    def approve_transaction(self, request, queryset):
        updated = 0
        for transaction in queryset.filter(status='pending'):
            transaction.status = 'completed'
            transaction.save()  # Triggers balance updates in model
            updated += 1
        self.message_user(request, f"{updated} transaction(s) approved successfully.", messages.SUCCESS)
    approve_transaction.short_description = "Approve selected pending transactions"

    def reject_transaction(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='failed')
        self.message_user(request, f"{updated} transaction(s) rejected successfully.", messages.SUCCESS)
    reject_transaction.short_description = "Reject selected pending transactions"

    def get_readonly_fields(self, request, obj=None):
        # All fields readonly when editing to prevent inconsistencies
        if obj:
            return self.readonly_fields
        return ('date', 'created_by')  # Only these are readonly when adding

admin.site.register(User, UserAdmin)