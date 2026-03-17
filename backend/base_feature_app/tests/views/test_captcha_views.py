"""Tests for reCAPTCHA views and verify_recaptcha helper."""

from unittest.mock import patch

import pytest
import requests
from django.test import override_settings
from django.urls import reverse
from rest_framework import status

from base_feature_app.views.captcha_views import verify_recaptcha


@pytest.mark.django_db
@override_settings(RECAPTCHA_SITE_KEY='test-site-key')
def test_get_site_key_returns_configured_key(api_client):
    """Return the reCAPTCHA site key from settings."""
    url = reverse('captcha-site-key')
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['site_key'] == 'test-site-key'


@pytest.mark.django_db
@override_settings(RECAPTCHA_SITE_KEY='')
def test_get_site_key_returns_empty_when_unset(api_client):
    """Return empty string when reCAPTCHA site key is not configured."""
    url = reverse('captcha-site-key')
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['site_key'] == ''


@pytest.mark.django_db
@patch('base_feature_app.views.captcha_views.verify_recaptcha', return_value=True)
def test_verify_captcha_success(mock_verify, api_client):
    """Return success when captcha token is valid."""
    url = reverse('captcha-verify')
    response = api_client.post(url, {'token': 'valid-token'}, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    mock_verify.assert_called_once_with('valid-token')


@pytest.mark.django_db
@patch('base_feature_app.views.captcha_views.verify_recaptcha', return_value=False)
def test_verify_captcha_failure(mock_verify, api_client):
    """Return 400 when captcha token is invalid."""
    url = reverse('captcha-verify')
    response = api_client.post(url, {'token': 'invalid-token'}, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['success'] is False
    mock_verify.assert_called_once_with('invalid-token')


@pytest.mark.django_db
def test_verify_recaptcha_returns_true_without_secret_key():
    """Treat captcha verification as pass-through when secret key is unset."""
    with override_settings(RECAPTCHA_SECRET_KEY=''):
        assert verify_recaptcha('any-token') is True


@pytest.mark.django_db
def test_verify_recaptcha_returns_false_without_token():
    """Reject captcha verification when token is missing."""
    with override_settings(RECAPTCHA_SECRET_KEY='secret'):
        assert verify_recaptcha('') is False


@pytest.mark.django_db
def test_verify_recaptcha_returns_false_on_request_exception():
    """Return false when captcha provider request raises an exception."""
    with override_settings(RECAPTCHA_SECRET_KEY='secret'):
        with patch('base_feature_app.views.captcha_views.requests.post', side_effect=requests.RequestException) as mock_post:
            assert verify_recaptcha('token') is False
        mock_post.assert_called_once()


@pytest.mark.django_db
def test_verify_recaptcha_returns_false_when_api_fails():
    """Return false when captcha provider response reports unsuccessful verification."""
    class ApiFailureResponse:
        def json(self):
            return {'success': False}

    with override_settings(RECAPTCHA_SECRET_KEY='secret'):
        with patch('base_feature_app.views.captcha_views.requests.post', return_value=ApiFailureResponse()) as mock_post:
            assert verify_recaptcha('token') is False
        mock_post.assert_called_once()


