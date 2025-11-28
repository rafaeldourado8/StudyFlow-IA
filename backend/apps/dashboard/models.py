from django.db import models
from django.conf import settings

class Task(models.Model):
    STATUS_CHOICES = (("pending", "Pendente"), ("in_progress", "Em Progresso"), ("completed", "Concluído"))
    PRIORITY_CHOICES = (("low", "Baixa"), ("medium", "Média"), ("high", "Alta"))
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # [NOVO] Campo para guardar os dados estruturados (Flashcard)
    ai_metadata = models.JSONField(default=dict, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return self.title
    class Meta: ordering = ["-created_at"]