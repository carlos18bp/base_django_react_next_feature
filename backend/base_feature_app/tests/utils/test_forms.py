import pytest

from base_feature_app.forms.user import UserChangeForm, UserCreationForm
from base_feature_app.models import User


@pytest.mark.django_db
def test_user_creation_form_validates_password_confirmation():
    """Verifies UserCreationForm is invalid when the two password fields do not match."""
    form = UserCreationForm(
        data={
            'email': 'user@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '123',
            'role': User.Role.CUSTOMER,
            'password1': 'pass1234',
            'password2': 'pass9999',
        }
    )

    assert form.is_valid() is False
    assert 'password2' in form.errors


@pytest.mark.django_db
def test_user_creation_form_saves_hashed_password():
    """Verifies UserCreationForm hashes the password when saving a new user."""
    form = UserCreationForm(
        data={
            'email': 'user@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '123',
            'role': User.Role.CUSTOMER,
            'password1': 'pass1234',
            'password2': 'pass1234',
        }
    )

    assert form.is_valid() is True
    user = form.save()

    assert user.check_password('pass1234') is True


@pytest.mark.django_db
def test_user_change_form_returns_initial_password():
    user = User.objects.create_user(email='change@example.com', password='pass1234')
    form = UserChangeForm(instance=user, initial={'password': user.password})

    assert form.clean_password() == user.password
