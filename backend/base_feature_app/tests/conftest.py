import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def existing_user(db):
    """Regular authenticated user for use in tests requiring a logged-in customer."""
    User = get_user_model()
    return User.objects.create_user(
        email='user@example.com',
        password='existingpassword',
        first_name='Test',
        last_name='User',
    )


@pytest.fixture
def admin_user(db):
    """Staff/admin user for use in tests requiring elevated permissions."""
    User = get_user_model()
    user = User.objects.create_user(
        email='admin@example.com',
        password='adminpassword',
        first_name='Admin',
        last_name='User',
    )
    user.is_staff = True
    user.is_superuser = True
    user.save(update_fields=['is_staff', 'is_superuser'])
    return user


@pytest.fixture
def authenticated_client(api_client, existing_user):
    """APIClient pre-authenticated as a regular user."""
    api_client.force_authenticate(user=existing_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """APIClient pre-authenticated as a staff/admin user."""
    api_client.force_authenticate(user=admin_user)
    return api_client
