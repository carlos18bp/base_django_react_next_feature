import pytest
from django.contrib.auth import get_user_model

from base_feature_app.utils import auth_utils


@pytest.mark.django_db
def test_generate_auth_tokens_contains_user_payload():
    User = get_user_model()
    user = User.objects.create_user(email='tokens@example.com', password='pass1234')

    tokens = auth_utils.generate_auth_tokens(user)

    assert tokens['user']['email'] == 'tokens@example.com'
    assert tokens['user']['id'] == user.id
    assert tokens['refresh']
    assert tokens['access']


@pytest.mark.django_db
def test_send_password_reset_code_success(monkeypatch):
    User = get_user_model()
    user = User.objects.create_user(email='reset@example.com', password='pass1234', first_name='Reset')
    sent = {}

    def fake_send_mail(subject, message, from_email, recipient_list, fail_silently):
        sent['subject'] = subject
        sent['recipients'] = recipient_list
        return 1

    monkeypatch.setattr(auth_utils, 'send_mail', fake_send_mail)

    assert auth_utils.send_password_reset_code(user, '123456') is True
    assert sent['recipients'] == [user.email]


@pytest.mark.django_db
def test_send_password_reset_code_failure(monkeypatch):
    User = get_user_model()
    user = User.objects.create_user(email='resetfail@example.com', password='pass1234', first_name='Reset')

    def fake_send_mail(*_args, **_kwargs):
        raise RuntimeError('send failed')

    monkeypatch.setattr(auth_utils, 'send_mail', fake_send_mail)

    assert auth_utils.send_password_reset_code(user, '123456') is False


@pytest.mark.django_db
def test_send_verification_code_success(monkeypatch):
    sent = {}

    def fake_send_mail(subject, message, from_email, recipient_list, fail_silently):
        sent['subject'] = subject
        sent['recipients'] = recipient_list
        return 1

    monkeypatch.setattr(auth_utils, 'send_mail', fake_send_mail)

    assert auth_utils.send_verification_code('verify@example.com', '654321') is True
    assert sent['recipients'] == ['verify@example.com']


@pytest.mark.django_db
def test_send_verification_code_failure(monkeypatch):
    def fake_send_mail(*_args, **_kwargs):
        raise RuntimeError('send failed')

    monkeypatch.setattr(auth_utils, 'send_mail', fake_send_mail)

    assert auth_utils.send_verification_code('verify@example.com', '654321') is False
