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

# --- NOVO MODELO DE CACHE ---
class TopicCache(models.Model):
    # normalizaremos o termo (ex: "docker" tudo minúsculo) para facilitar a busca
    topic = models.CharField(max_length=255, unique=True, db_index=True) 
    # Armazena o JSON completo (definition, origin, etc)
    data = models.JSONField() 
    # Armazena a profundidade para saber se é initial ou deep
    depth = models.CharField(max_length=20, default="initial")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"Cache: {self.topic} ({self.depth})"