"""Tests to exercise shared fixtures (conftest.py) and helper utilities (helpers.py)."""

import pytest

from base_feature_app.tests.helpers import get_paginated_results, make_contact_payload


# ── Fixture coverage ─────────────────────────────────────────────────


@pytest.mark.django_db
def test_existing_user_fixture_creates_regular_user(existing_user):
    """existing_user fixture returns a non-staff user with expected email."""
    assert existing_user.email == "user@example.com"
    assert existing_user.is_staff is False
    assert existing_user.is_superuser is False
    assert existing_user.check_password("existingpassword")


@pytest.mark.django_db
def test_admin_user_fixture_creates_staff_superuser(admin_user):
    """admin_user fixture returns a staff superuser with expected email."""
    assert admin_user.email == "admin@example.com"
    assert admin_user.is_staff is True
    assert admin_user.is_superuser is True
    assert admin_user.check_password("adminpassword")


@pytest.mark.django_db
def test_authenticated_client_is_logged_in(authenticated_client, existing_user):
    """authenticated_client fixture returns an APIClient authenticated as existing_user."""
    assert authenticated_client.handler._force_user == existing_user


@pytest.mark.django_db
def test_admin_client_is_logged_in(admin_client, admin_user):
    """admin_client fixture returns an APIClient authenticated as admin_user."""
    assert admin_client.handler._force_user == admin_user


# ── helpers.get_paginated_results ────────────────────────────────────


def test_get_paginated_results_returns_results_from_paginated_response():
    """get_paginated_results extracts 'results' list from a paginated dict."""
    data = {"count": 2, "results": [{"id": 1}, {"id": 2}]}
    assert get_paginated_results(data) == [{"id": 1}, {"id": 2}]


def test_get_paginated_results_returns_raw_data_when_not_paginated():
    """get_paginated_results returns original data when not a paginated dict."""
    data = [{"id": 1}, {"id": 2}]
    assert get_paginated_results(data) == [{"id": 1}, {"id": 2}]


def test_get_paginated_results_returns_dict_without_results_key():
    """get_paginated_results returns the dict itself when 'results' key is missing."""
    data = {"detail": "not found"}
    assert get_paginated_results(data) == {"detail": "not found"}


# ── helpers.make_contact_payload ─────────────────────────────────────


def test_make_contact_payload_with_captcha_token():
    """make_contact_payload includes captcha_token when provided."""
    payload = make_contact_payload(captcha_token="test-token-abc")
    assert payload["captcha_token"] == "test-token-abc"
    assert payload["name"] == "Juan Pérez"


def test_make_contact_payload_without_captcha_token():
    """make_contact_payload excludes captcha_token when empty."""
    payload = make_contact_payload()
    assert "captcha_token" not in payload
    assert payload["email"] == "juan@example.com"
