"""Serializer for contact form submissions."""

from rest_framework import serializers


class ContactFormSerializer(serializers.Serializer):
    """Validates incoming contact/lead form data."""

    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50)
    program = serializers.CharField(max_length=200)
    captcha_token = serializers.CharField(max_length=2048, required=False, allow_blank=True)
