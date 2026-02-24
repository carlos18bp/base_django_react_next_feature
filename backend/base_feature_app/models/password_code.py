from django.db import models
from base_feature_app.models import User

class PasswordCode(models.Model):
    """
    Password reset code model.
    
    Stores 6-digit codes for password reset functionality.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Code for {self.user.email} - {self.code}"
    
    @classmethod
    def generate_code(cls, user):
        """
        Generate a new 6-digit code for the user.
        """
        import random
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return cls.objects.create(user=user, code=code)
    
    def is_valid(self):
        """
        Check if code is still valid (not used and less than 15 minutes old).
        """
        if self.used:
            return False
        
        from django.utils import timezone
        from datetime import timedelta
        age = timezone.now() - self.created_at
        return age < timedelta(minutes=15)
