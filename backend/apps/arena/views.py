from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .services import ArenaService
from .models import PlayerProfile, TopicMastery
from .serializers import LeaderboardSerializer, MasterySerializer, GameResultSerializer

class GenerateQuizView(APIView):
    """Inicia o jogo baseando-se no nível atual do usuário"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_topic = request.data.get('topic', 'Geral')
        # Normaliza o tópico (ex: "Python Avançado" -> "python")
        topic_key = raw_topic.strip().lower().split()[0] 

        # Busca ou cria o progresso
        mastery, _ = TopicMastery.objects.get_or_create(
            user=request.user, 
            topic=topic_key,
            defaults={'topic': topic_key} # Garante salvar o nome
        )

        # Define dificuldade para a IA
        difficulty_prompt = f"Nível {mastery.level} de 10 (Rank {mastery.get_tier_display()})"
        
        service = ArenaService()
        data = service.generate_quiz(raw_topic, difficulty_prompt)
        
        if "error" in data: return Response(data, status=500)
        
        # Adiciona metadados do progresso na resposta para o front saber
        data['player_status'] = {
            'topic': topic_key,
            'level': mastery.level,
            'tier': mastery.tier
        }
        
        return Response(data)

class SubmitScoreView(APIView):
    """Salva XP e Progresso no Tópico"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GameResultSerializer(data=request.data)
        if serializer.is_valid():
            topic = serializer.validated_data['topic']
            xp = serializer.validated_data['xp_gained']
            passed = serializer.validated_data['passed']

            # 1. Atualiza XP Global
            profile, _ = PlayerProfile.objects.get_or_create(user=request.user)
            profile.add_xp(xp)

            # 2. Atualiza Progresso do Tópico (Se passou)
            mastery_info = {}
            if passed:
                mastery, _ = TopicMastery.objects.get_or_create(user=request.user, topic=topic)
                upgraded, reason = mastery.level_up()
                mastery_info = {
                    'new_level': mastery.level,
                    'new_tier': mastery.tier,
                    'event': reason # "Level Up" ou "Tier Up: gold"
                }

            return Response({
                "global_xp": profile.xp,
                "mastery_update": mastery_info
            })
        return Response(serializer.errors, status=400)

class MyMasteryListView(generics.ListAPIView):
    """Lista todos os tópicos que o usuário já jogou"""
    permission_classes = [IsAuthenticated]
    serializer_class = MasterySerializer
    
    def get_queryset(self):
        return TopicMastery.objects.filter(user=self.request.user)

class LeaderboardView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaderboardSerializer
    queryset = PlayerProfile.objects.all()[:10]