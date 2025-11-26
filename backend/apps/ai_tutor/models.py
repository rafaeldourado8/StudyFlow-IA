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

# --- CORREÇÃO AQUI ---
class TopicCache(models.Model):
    # Removido unique=True, mantido apenas db_index=True para performance
    topic = models.CharField(max_length=255, db_index=True) 
    
    data = models.JSONField() 
    depth = models.CharField(max_length=20, default="initial")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Garante que não existam dois "redis" do tipo "initial", 
        # mas permite "redis" + "initial" E "redis" + "deep"
        unique_together = ('topic', 'depth')

    def __str__(self): return f"Cache: {self.topic} ({self.depth})"