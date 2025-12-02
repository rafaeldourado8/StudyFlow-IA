from django.contrib import admin
from .models import UserJourney

@admin.register(UserJourney)
class UserJourneyAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_current_world', 'current_level_index', 'updated_at')
    search_fields = ('user__email', 'user__name')
    list_filter = ('current_world_index',)

    def get_current_world(self, obj):
        # Mapeia o índice para um nome legível baseado no seu curriculum.py
        worlds = ["Junior (Fundamentos)", "Pleno (Qualidade)", "Arquiteto (Nexus)"]
        if 0 <= obj.current_world_index < len(worlds):
            return worlds[obj.current_world_index]
        return f"Mundo {obj.current_world_index + 1}"
    get_current_world.short_description = "Mundo Atual"