import logging
from django.contrib.auth.signals import user_login_failed
from django.dispatch import receiver

logger = logging.getLogger('django.security')

@receiver(user_login_failed)
def log_failed_login(sender, credentials, request, **kwargs):
    # Loga IP e Email tentado (sem senha!)
    ip = request.META.get('REMOTE_ADDR')
    email = credentials.get('email', 'unknown')
    logger.warning(f"❌ Falha de Login: Email={email}, IP={ip}")