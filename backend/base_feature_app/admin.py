import json
import logging

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.urls import path, reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django_attachments.admin import AttachmentsAdminMixin

from .forms.blog import BlogForm
from .forms.product import ProductForm
from .forms.user import UserChangeForm, UserCreationForm
from .models import Blog, Product, Sale, SoldProduct, User, PasswordCode
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
        if not obj.pk:
            return '-'
        url = reverse('myadmin:base_feature_app_user_login-as', args=[obj.pk])
        return format_html(
            '<a href="{}" target="_blank" style="'
            'background:#417690;color:#fff;padding:5px 15px;'
            'border-radius:4px;text-decoration:none;font-weight:bold;'
            '">Login as this user</a>',
            url,
        )
    login_as_link.short_description = _('Impersonate')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:user_id>/login-as/',
                self.admin_site.admin_view(self.login_as_user),
                name='base_feature_app_user_login-as',
            ),
        ]
        return custom_urls + urls

    def login_as_user(self, request, user_id):
        if not request.user.is_superuser:
            return HttpResponseForbidden('Only superusers can use this feature.')

        from django.utils.html import escape as html_escape

        user = get_object_or_404(User, pk=user_id)
        tokens = generate_auth_tokens(user)
        access_token = tokens['access']
        refresh_token = tokens['refresh']
        user_data = json.dumps(tokens['user'])

        logger.info('Admin %s logged in as %s', request.user.email, user.email)

        safe_email = html_escape(user.email)
        js_access = json.dumps(access_token).replace('</', '<\\/')
        js_refresh = json.dumps(refresh_token).replace('</', '<\\/')
        js_user = user_data.replace('</', '<\\/')

        html = f"""<!DOCTYPE html>
<html>
<head><title>Logging in as {safe_email}...</title></head>
<body>
<p>Logging in as <strong>{safe_email}</strong>...</p>
<script>
document.cookie = "access_token=" + {js_access} + "; path=/; SameSite=Lax";
document.cookie = "refresh_token=" + {js_refresh} + "; path=/; SameSite=Lax";
localStorage.setItem("user_data", JSON.stringify({js_user}));
window.location.href = "/dashboard";
</script>
</body>
</html>"""
        return HttpResponse(html)


class PasswordCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'used')
    search_fields = ('user__email', 'code')
    list_filter = ('used', 'created_at')
    readonly_fields = ('created_at',)
    
    def has_add_permission(self, request):
        # Don't allow manual creation from admin
        return False


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