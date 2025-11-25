from django.db import models
from django.conf import settings

class TutorInteraction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_interactions")
    subject = models.CharField(max_length=100, default="Geral")
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: ordering = ["-created_at"]
    def __str__(self): return f"{self.user.email} - {self.subject}"