from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User
from .forms.user import UserChangeForm, UserCreationForm


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
        (None, {'fields': ('email', 'password')}),
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

    readonly_fields = ('date_joined',)
    filter_horizontal = ('groups', 'user_permissions')


# ============================================================================
# CUSTOM ADMIN SITE
# ============================================================================

class BaseFeatureAdminSite(admin.AdminSite):
    site_header = 'Corporación Fernando de Aragón - Administración'
    site_title = 'Fernando de Aragón Admin'
    index_title = 'Panel de Control'

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        base_app_models = app_dict.get('base_feature_app', {}).get('models', [])
        
        custom_app_list = [
            {
                'name': _('👥 User Management'),
                'app_label': 'user_management',
                'models': [
                    model for model in base_app_models
                    if model['object_name'] in ['User']
                ]
            },
        ]
        
        # Filter out empty sections
        custom_app_list = [section for section in custom_app_list if section['models']]
        
        return custom_app_list


# ============================================================================
# REGISTER MODELS
# ============================================================================

admin_site = BaseFeatureAdminSite(name='myadmin')
admin_site.register(User, BaseFeatureUserAdmin)