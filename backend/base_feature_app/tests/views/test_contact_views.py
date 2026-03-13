"""Tests for contact form submission endpoint."""

from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.tests.helpers import make_contact_payload


@pytest.mark.django_db
def test_submit_contact_form_sends_email(api_client):
    """Valid contact form submission sends notification email and returns success."""
    payload = make_contact_payload()
    url = reverse('contact-submit')

    with patch('base_feature_app.views.contact.EmailService') as mock_svc:
        mock_svc.send_contact_notification.return_value = True
        response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    mock_svc.send_contact_notification.assert_called_once_with(
        name=payload['name'],
        email=payload['email'],
        phone=payload['phone'],
        program=payload['program'],
    )


@pytest.mark.django_db
def test_submit_contact_form_missing_name(api_client):
    """Return 400 when required name field is missing."""
    payload = make_contact_payload()
    del payload['name']
    url = reverse('contact-submit')

    response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'name' in response.data['errors']


@pytest.mark.django_db
def test_submit_contact_form_missing_email(api_client):
    """Return 400 when required email field is missing."""
    payload = make_contact_payload()
    del payload['email']
    url = reverse('contact-submit')

    response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'email' in response.data['errors']


@pytest.mark.django_db
def test_submit_contact_form_invalid_email(api_client):
    """Return 400 when email is not a valid email address."""
    payload = make_contact_payload(email='not-an-email')
    url = reverse('contact-submit')

    response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'email' in response.data['errors']


@pytest.mark.django_db
def test_submit_contact_form_missing_phone(api_client):
    """Return 400 when required phone field is missing."""
    payload = make_contact_payload()
    del payload['phone']
    url = reverse('contact-submit')

    response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'phone' in response.data['errors']


@pytest.mark.django_db
def test_submit_contact_form_missing_program(api_client):
    """Return 400 when required program field is missing."""
    payload = make_contact_payload()
    del payload['program']
    url = reverse('contact-submit')

    response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'program' in response.data['errors']


@pytest.mark.django_db
def test_submit_contact_form_email_failure_returns_500(api_client):
    """Return 500 when email service fails."""
    payload = make_contact_payload()
    url = reverse('contact-submit')

    with patch('base_feature_app.views.contact.EmailService') as mock_svc:
        mock_svc.send_contact_notification.side_effect = Exception('SMTP error')
        response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert response.data['success'] is False


@pytest.mark.django_db
@patch('base_feature_app.views.contact.verify_recaptcha', return_value=False)
def test_submit_contact_form_captcha_failure(mock_verify, api_client):
    """Return 400 when captcha token is provided but verification fails."""
    payload = make_contact_payload(captcha_token='bad-token')
    url = reverse('contact-submit')

    response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['success'] is False
    mock_verify.assert_called_once_with('bad-token')


@pytest.mark.django_db
@patch('base_feature_app.views.contact.verify_recaptcha', return_value=True)
def test_submit_contact_form_captcha_success(mock_verify, api_client):
    """Proceed when captcha token is valid."""
    payload = make_contact_payload(captcha_token='good-token')
    url = reverse('contact-submit')

    with patch('base_feature_app.views.contact.EmailService') as mock_svc:
        mock_svc.send_contact_notification.return_value = True
        response = api_client.post(url, payload, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    mock_verify.assert_called_once_with('good-token')
