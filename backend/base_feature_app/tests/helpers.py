"""
Test helper utilities shared across multiple test modules.

These are utility functions (not fixtures) that provide common
data-building or response-parsing operations reused in tests.
"""


def get_paginated_results(response_data):
    """
    Extract results list from a DRF PageNumberPagination response.

    Args:
        response_data: The parsed JSON body of a paginated API response.

    Returns:
        list: The 'results' array, or the original data if not paginated.
    """
    if isinstance(response_data, dict) and 'results' in response_data:
        return response_data['results']
    return response_data


def make_contact_payload(
    name='Juan Pérez',
    email='juan@example.com',
    phone='+57 300 1234567',
    program='Inglés',
    captcha_token='',
):
    """
    Build a valid contact form payload for testing.

    Returns:
        dict: Contact form data.
    """
    payload = {
        'name': name,
        'email': email,
        'phone': phone,
        'program': program,
    }
    if captcha_token:
        payload['captcha_token'] = captcha_token
    return payload
