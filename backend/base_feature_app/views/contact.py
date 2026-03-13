"""Views for contact form submissions.

Receives lead/contact form data and sends notification emails.
"""

import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.serializers.contact import ContactFormSerializer
from base_feature_app.services.email_service import EmailService
from base_feature_app.views.captcha_views import verify_recaptcha

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_contact_form(request):
    """Receive a contact/lead form submission and send notification email.

    Request body:
        {
            "name": "Full name",
            "email": "user@example.com",
            "phone": "Phone number",
            "program": "Selected program name",
            "captcha_token": "optional reCAPTCHA token"
        }

    Returns:
        Response: JSON with success status.
    """
    serializer = ContactFormSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = serializer.validated_data

    # Verify captcha if token is provided
    captcha_token = data.get('captcha_token', '')
    if captcha_token:
        if not verify_recaptcha(captcha_token):
            return Response(
                {'success': False, 'detail': 'reCAPTCHA verification failed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    try:
        EmailService.send_contact_notification(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            program=data['program'],
        )
        return Response({'success': True, 'detail': 'Mensaje enviado correctamente.'})
    except Exception:
        logger.exception('Failed to send contact form email')
        return Response(
            {'success': False, 'detail': 'Error al enviar el mensaje. Intenta de nuevo.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
