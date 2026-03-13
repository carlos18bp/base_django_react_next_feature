import pytest
from django.test import RequestFactory

from base_feature_app.admin import admin_site
from base_feature_app.models import User


@pytest.mark.django_db
def test_admin_site_custom_sections():
    """Verifies the custom admin site exposes the User model section in the app list."""
    User.objects.create_superuser(email='admin@example.com', password='pass1234')
    request = RequestFactory().get('/admin/')
    request.user = User.objects.get(email='admin@example.com')

    app_list = admin_site.get_app_list(request)

    object_names = {model['object_name'] for section in app_list for model in section['models']}

    assert 'User' in object_names
