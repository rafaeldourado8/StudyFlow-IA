from rest_framework import serializers
from .models import PlayerProfile, TopicMastery
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRankSerializer(serializers.ModelSerializer):
    class Meta: model = User; fields = ['name']

class LeaderboardSerializer(serializers.ModelSerializer):
    user = UserRankSerializer(read_only=True)
    class Meta: model = PlayerProfile; fields = ['user', 'xp', 'level']

class MasterySerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicMastery
        fields = ['topic', 'level', 'tier']

class GameResultSerializer(serializers.Serializer):
    topic = serializers.CharField()
    xp_gained = serializers.IntegerField()
    passed = serializers.BooleanField() # Se passou de nível ou não