from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class PlayerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="player_profile")
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1) # Nível Global do Jogador
    quizzes_played = models.IntegerField(default=0)
    
    class Meta: ordering = ['-xp']

    def add_xp(self, amount):
        self.xp += amount
        self.quizzes_played += 1
        self.level = (self.xp // 1000) + 1 # Nível sobe a cada 1000 XP
        self.save()

    def __str__(self): return f"{self.user.name} ({self.xp} XP)"

# --- NOVO MODELO ---
class TopicMastery(models.Model):
    """Rastreia o progresso em um tópico específico (ex: Python)"""
    TIER_CHOICES = (
        ('iron', 'Ferro'),       # 0
        ('bronze', 'Bronze'),    # 1
        ('silver', 'Prata'),     # 2
        ('gold', 'Ouro'),        # 3
        ('platinum', 'Platina'), # 4 (Max)
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="masteries")
    topic = models.CharField(max_length=100) # Ex: "python", "react"
    
    level = models.IntegerField(default=1)   # 1 a 10
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='iron')
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'topic') # Um registro por tópico por usuário
        ordering = ['-tier', '-level']

    # --- CORREÇÃO: Método Adicionado ---
    def get_xp_for_next_level(self):
        """
        Retorna XP necessário para o próximo nível.
        Como o sistema atual sobe de nível por 'vitória', 
        retornamos um valor estimado para exibição no frontend.
        """
        return 100 * self.level

    def level_up(self):
        """Lógica de subida de nível e tier"""
        if self.tier == 'platinum' and self.level == 10:
            return False, "Maxed" # Já platinou

        if self.level < 10:
            self.level += 1
            self.save()
            return True, "Level Up"
        else:
            # Chegou no 10, sobe de Tier e reseta pro 1
            tiers = ['iron', 'bronze', 'silver', 'gold', 'platinum']
            current_idx = tiers.index(self.tier)
            
            if current_idx < len(tiers) - 1:
                self.tier = tiers[current_idx + 1]
                self.level = 1
                self.save()
                return True, f"Tier Up: {self.tier}"
            
        return False, "Erro"

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_player_profile(sender, instance, created, **kwargs):
    if created: PlayerProfile.objects.create(user=instance)