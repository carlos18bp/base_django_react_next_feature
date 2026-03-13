"""
Email service for handling all outbound email notifications.

Centralizes email logic following the service layer pattern.
"""

from django.conf import settings
from django.core.mail import send_mail


class EmailService:
    """
    Service class for sending email notifications.

    Provides static methods for all transactional emails sent
    by the application, abstracting the underlying mail backend.
    """

    @staticmethod
    def send_contact_notification(name: str, email: str, phone: str, program: str) -> bool:
        """
        Send a contact form notification email to the site administrators.

        Args:
            name: Full name of the person requesting info.
            email: Contact email address.
            phone: Contact phone number.
            program: Name of the program they are interested in.

        Returns:
            bool: True if the email was sent successfully.

        Raises:
            Exception: If the email fails to send.
        """
        subject = f'Nueva solicitud de información - {program}'
        message = (
            f'Se ha recibido una nueva solicitud de información:\n\n'
            f'Nombre: {name}\n'
            f'Correo: {email}\n'
            f'Teléfono: {phone}\n'
            f'Programa: {program}\n'
        )

        recipient = getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', settings.DEFAULT_FROM_EMAIL)

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        return True
