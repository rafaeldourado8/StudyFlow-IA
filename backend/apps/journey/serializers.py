from rest_framework import serializers
from .models import UserJourney

class UserJourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserJourney
        fields = [
            'current_world_index', 
            'current_level_index', 
            'completed_levels', 
            'updated_at'
        ]
        read_only_fields = ['user', 'updated_at']