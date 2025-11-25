from django.contrib import admin
from .models import TutorInteraction


@admin.register(TutorInteraction)
class TutorAdmin(admin.ModelAdmin):
    list_display = ("user", "subject", "created_at")