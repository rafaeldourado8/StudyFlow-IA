from django.db import models
from django.conf import settings

class UserJourney(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="journey")
    
    # Índice do mundo atual (0, 1, 2)
    current_world_index = models.IntegerField(default=0)
    
    # Índice do nível dentro do mundo atual (0, 1, 2...)
    # Se esse número for maior que a qtd de níveis, significa que está no Boss
    current_level_index = models.IntegerField(default=0)
    
    # Lista de IDs completados para histórico e validação visual
    # Ex: ["w1_l1", "w1_l2"]
    completed_levels = models.JSONField(default=list, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Jornada de {self.user.name} (Mundo {self.current_world_index + 1})"