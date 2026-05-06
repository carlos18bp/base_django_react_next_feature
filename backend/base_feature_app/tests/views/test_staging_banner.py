from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from base_feature_app.models import StagingPhaseBanner


@pytest.fixture
def banner(db):
    instance, _ = StagingPhaseBanner.objects.get_or_create(pk=1)
    return instance


@pytest.mark.django_db
def test_staging_banner_endpoint_returns_200(api_client, banner):
    url = reverse('staging-banner')

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_staging_banner_inactive_when_started_at_is_null(api_client, banner):
    banner.started_at = None
    banner.save()
    url = reverse('staging-banner')

    response = api_client.get(url)

    body = response.json()
    assert body['started_at'] is None
    assert body['days_remaining'] is None
    assert body['is_expired'] is False


@pytest.mark.django_db
def test_staging_banner_active_design_phase_returns_remaining_days(api_client, banner):
    banner.current_phase = StagingPhaseBanner.PHASE_DESIGN
    banner.started_at = timezone.now()
    banner.save()
    url = reverse('staging-banner')

    response = api_client.get(url)

    body = response.json()
    assert body['current_phase'] == StagingPhaseBanner.PHASE_DESIGN
    assert body['phase_labels'] == {'es': 'Etapa de diseño', 'en': 'Design phase'}
    assert body['is_expired'] is False
    assert body['days_remaining'] == banner.design_duration_days


@pytest.mark.django_db
def test_staging_banner_expired_when_phase_window_elapsed(api_client, banner):
    banner.current_phase = StagingPhaseBanner.PHASE_DEVELOPMENT
    banner.started_at = timezone.now() - timedelta(days=banner.development_duration_days + 1)
    banner.save()
    url = reverse('staging-banner')

    response = api_client.get(url)

    body = response.json()
    assert body['is_expired'] is True
    assert body['days_remaining'] == 0


@pytest.mark.django_db
def test_staging_banner_exposes_contact_details(api_client, banner):
    url = reverse('staging-banner')

    response = api_client.get(url)

    body = response.json()
    assert body['contact_whatsapp'] == '+57 323 8122373'
    assert body['contact_email'] == 'team@projectapp.co'


@pytest.mark.django_db
def test_staging_banner_does_not_expose_internal_duration_config(api_client, banner):
    url = reverse('staging-banner')

    response = api_client.get(url)

    body = response.json()
    assert 'design_duration_days' not in body
    assert 'development_duration_days' not in body
