import logging
from urllib.parse import urlencode

from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import path, reverse
from django.contrib import messages
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django_attachments.admin import AttachmentsAdminMixin

from django.utils import timezone

from .forms.blog import BlogForm
from .forms.product import ProductForm
from .forms.user import UserChangeForm, UserCreationForm
from .models import Blog, Product, Sale, SoldProduct, User, PasswordCode, StagingPhaseBanner
from .utils.auth_utils import generate_auth_tokens

logger = logging.getLogger(__name__)


# ============================================================================
# BLOG MANAGEMENT
# ============================================================================

class BlogAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    form = BlogForm
    list_display = ('title', 'category')
    search_fields = ('title', 'category')
    list_filter = ('category',)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


# ============================================================================
# PRODUCT MANAGEMENT
# ============================================================================

class ProductAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    form = ProductForm
    list_display = ('title', 'category', 'sub_category', 'price')
    search_fields = ('title', 'category', 'sub_category')
    list_filter = ('category', 'sub_category')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


# ============================================================================
# SALES MANAGEMENT
# ============================================================================

class SoldProductAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity')
    search_fields = ('product__title',)
    list_filter = ('product',)


class SaleAdmin(admin.ModelAdmin):
    list_display = ('email', 'address', 'city', 'state', 'postal_code', 'get_total_products')
    search_fields = ('email', 'city', 'state')
    list_filter = ('state', 'city')
    filter_horizontal = ('sold_products',)

    def get_total_products(self, obj):
        return obj.sold_products.count()
    get_total_products.short_description = 'Total Products'

    def delete_queryset(self, request, queryset):
        for sale in queryset:
            sale.delete()


# ============================================================================
# USER MANAGEMENT
# ============================================================================

class BaseFeatureUserAdmin(UserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    ordering = ('email',)
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('email', 'password', 'login_as_link')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone')}),
        (_('Role'), {'fields': ('role',)}),
        (
            _('Permissions'),
            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')},
        ),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'password1', 'password2', 'role'),
            },
        ),
    )

    readonly_fields = ('date_joined', 'login_as_link')
    filter_horizontal = ('groups', 'user_permissions')

    def login_as_link(self, obj):
        if not obj or not obj.pk:
            return '—'
        url = reverse('myadmin:base_feature_app_user_login_as', args=[obj.pk])
        return format_html(
            '<a class="button" href="{}" style="text-decoration:none" target="_blank" rel="noopener">Login as this user</a>',
            url,
        )
    login_as_link.short_description = _('Impersonate')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:user_id>/login_as/',
                self.admin_site.admin_view(self.login_as_user_view),
                name='base_feature_app_user_login_as',
            ),
        ]
        return custom_urls + urls

    def login_as_user_view(self, request, user_id):
        if not (request.user.is_active and request.user.is_superuser):
            raise PermissionDenied('Only active superusers can use Login-as.')

        target = get_object_or_404(User, pk=user_id)
        change_url = reverse('myadmin:base_feature_app_user_change', args=[user_id])

        if target.is_superuser and target.pk != request.user.pk:
            messages.error(request, _('You cannot log in as another superuser.'))
            return HttpResponseRedirect(change_url)

        if not target.is_active:
            messages.error(request, _('This user is inactive.'))
            return HttpResponseRedirect(change_url)

        tokens = generate_auth_tokens(target)
        logger.info('admin %s logged in as user %s', request.user.email, target.email)

        query = urlencode({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'redirect': '/',
        })
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/admin-login?{query}')


class PasswordCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'used')
    search_fields = ('user__email', 'code')
    list_filter = ('used', 'created_at')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        # Don't allow manual creation from admin
        return False


# ============================================================================
# STAGING PHASE BANNER
# ============================================================================
# DO NOT DELETE this admin: it controls the staging review banner shown to
# clients. Hide via the `is_visible` toggle / "Hide banner" action — never
# unregister or remove the model. See `pre-staging-cleanup` skill for details.

class StagingPhaseBannerAdmin(admin.ModelAdmin):
    list_display = ('current_phase', 'is_visible', 'started_at', 'expires_at', 'days_remaining')
    readonly_fields = ('expires_at', 'days_remaining', 'is_expired', 'updated_at')
    fieldsets = (
        (_('Visibility'), {'fields': ('is_visible',)}),
        (_('Phase'), {'fields': ('current_phase', 'started_at', 'expires_at', 'days_remaining', 'is_expired')}),
        (_('Durations (calendar days)'), {'fields': ('design_duration_days', 'development_duration_days')}),
        (_('Contact'), {'fields': ('contact_whatsapp', 'contact_email')}),
        (_('Audit'), {'fields': ('updated_at',)}),
    )
    actions = ['start_design_phase', 'start_development_phase', 'show_banner', 'hide_banner']

    def has_add_permission(self, request):
        return not StagingPhaseBanner.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def start_design_phase(self, request, queryset):
        for obj in queryset:
            obj.current_phase = StagingPhaseBanner.PHASE_DESIGN
            obj.started_at = timezone.now()
            obj.save()
        self.message_user(request, _('Design phase started. Countdown reset.'))
    start_design_phase.short_description = _('▶ Start design phase (resets countdown)')

    def start_development_phase(self, request, queryset):
        for obj in queryset:
            obj.current_phase = StagingPhaseBanner.PHASE_DEVELOPMENT
            obj.started_at = timezone.now()
            obj.save()
        self.message_user(request, _('Development phase started. Countdown reset.'))
    start_development_phase.short_description = _('▶ Start development phase (resets countdown)')

    def show_banner(self, request, queryset):
        queryset.update(is_visible=True)
        self.message_user(request, _('Banner shown.'))
    show_banner.short_description = _('👁 Show banner')

    def hide_banner(self, request, queryset):
        queryset.update(is_visible=False)
        self.message_user(request, _('Banner hidden.'))
    hide_banner.short_description = _('🙈 Hide banner')


# ============================================================================
# CUSTOM ADMIN SITE - ORGANIZED BY SECTIONS
# ============================================================================

class BaseFeatureAdminSite(admin.AdminSite):
    site_header = 'Base Feature Administration'
    site_title = 'Base Feature Admin'
    index_title = 'Welcome to Base Feature Control Panel'

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        base_app_models = app_dict.get('base_feature_app', {}).get('models', [])
        
        # Custom structure for the admin index organized by sections
        custom_app_list = [
            {
                'name': _('👥 User Management'),
                'app_label': 'user_management',
                'models': [
                    model for model in base_app_models
                    if model['object_name'] in ['User', 'PasswordCode']
                ]
            },
            {
                'name': _('📝 Blog Management'),
                'app_label': 'blog_management',
                'models': [
                    model for model in base_app_models
                    if model['object_name'] in ['Blog']
                ]
            },
            {
                'name': _('🛍️ Product Management'),
                'app_label': 'product_management',
                'models': [
                    model for model in base_app_models
                    if model['object_name'] in ['Product']
                ]
            },
            {
                'name': _('💰 Sales Management'),
                'app_label': 'sales_management',
                'models': [
                    model for model in base_app_models
                    if model['object_name'] in ['Sale', 'SoldProduct']
                ]
            },
            {
                'name': _('🚧 Staging Phase Banner'),
                'app_label': 'staging_management',
                'models': [
                    model for model in base_app_models
                    if model['object_name'] in ['StagingPhaseBanner']
                ]
            },
        ]
        
        # Filter out empty sections
        custom_app_list = [section for section in custom_app_list if section['models']]
        
        return custom_app_list


# ============================================================================
# REGISTER MODELS
# ============================================================================

# Create an instance of the custom AdminSite
admin_site = BaseFeatureAdminSite(name='myadmin')

# Register all models with the custom AdminSite
admin_site.register(User, BaseFeatureUserAdmin)
admin_site.register(PasswordCode, PasswordCodeAdmin)
admin_site.register(Blog, BlogAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Sale, SaleAdmin)
admin_site.register(SoldProduct, SoldProductAdmin)
admin_site.register(StagingPhaseBanner, StagingPhaseBannerAdmin)
