import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .services import ArenaService
from .models import PlayerProfile, TopicMastery
from .serializers import LeaderboardSerializer, MasterySerializer, GameResultSerializer

logger = logging.getLogger(__name__)

class GenerateQuizView(APIView):
    """Inicia o jogo baseando-se no nível atual do usuário"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            raw_topic = request.data.get('topic', 'Geral')
            logger.info(f"🎮 [GenerateQuiz] User={request.user.email}, Topic={raw_topic}")
            
            # Normaliza o tópico (ex: "Python Avançado" -> "python")
            topic_key = raw_topic.strip().lower().split()[0]

            # Busca ou cria o progresso
            mastery, created = TopicMastery.objects.get_or_create(
                user=request.user, 
                topic=topic_key,
                defaults={'topic': topic_key}
            )
            
            if created:
                logger.info(f"📊 Novo tópico criado: {topic_key} para {request.user.email}")

            # CORREÇÃO: Mapeia o nível para dificuldade padrão
            # Nível 1-3 = easy, 4-7 = medium, 8-10 = hard
            if mastery.level <= 3:
                difficulty = "easy"
            elif mastery.level <= 7:
                difficulty = "medium"
            else:
                difficulty = "hard"
            
            logger.info(f"📈 Nível do jogador: {mastery.level}, Dificuldade: {difficulty}")
            
            # Chama o serviço com parâmetros corretos
            service = ArenaService()
            data = service.generate_quiz(
                topic=raw_topic,  # Mantém o tópico original (ex: "Python Avançado")
                difficulty=difficulty
            )
            
            # Verifica se houve erro na geração
            if "error" in data and not data.get("questions"):
                logger.error(f"❌ Erro ao gerar quiz: {data['error']}")
                return Response(data, status=500)
            
            # Valida se as perguntas foram geradas
            if not data.get("questions"):
                logger.error("❌ Nenhuma pergunta foi gerada")
                return Response({
                    "error": "Falha ao gerar perguntas. Tente novamente.",
                    "questions": []
                }, status=500)
            
            # Adiciona metadados do progresso para o frontend
            data['player_status'] = {
                'topic': topic_key,
                'level': mastery.level,
                'tier': mastery.tier,
                'tier_display': mastery.get_tier_display(),
                'xp_required': mastery.get_xp_for_next_level()
            }
            
            logger.info(f"✅ Quiz gerado com {len(data['questions'])} perguntas")
            return Response(data)
            
        except Exception as e:
            logger.exception(f"❌ Erro crítico em GenerateQuizView: {str(e)}")
            return Response({
                "error": f"Erro ao gerar quiz: {str(e)}",
                "questions": []
            }, status=500)


class SubmitScoreView(APIView):
    """Salva XP e Progresso no Tópico"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = GameResultSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"⚠️ Dados inválidos: {serializer.errors}")
                return Response(serializer.errors, status=400)
            
            topic = serializer.validated_data['topic']
            xp = serializer.validated_data['xp_gained']
            passed = serializer.validated_data['passed']
            
            logger.info(f"💾 [SubmitScore] User={request.user.email}, Topic={topic}, XP={xp}, Passed={passed}")

            # 1. Atualiza XP Global
            profile, _ = PlayerProfile.objects.get_or_create(user=request.user)
            old_xp = profile.xp
            profile.add_xp(xp)
            logger.info(f"📊 XP atualizado: {old_xp} → {profile.xp}")

            # 2. Atualiza Progresso do Tópico (Se passou)
            mastery_info = {}
            if passed:
                mastery, _ = TopicMastery.objects.get_or_create(
                    user=request.user, 
                    topic=topic
                )
                old_level = mastery.level
                upgraded, reason = mastery.level_up()
                
                mastery_info = {
                    'new_level': mastery.level,
                    'new_tier': mastery.tier,
                    'tier_display': mastery.get_tier_display(),
                    'event': reason,  # "Level Up" ou "Tier Up: gold"
                    'level_changed': mastery.level > old_level
                }
                
                if upgraded:
                    logger.info(f"🎉 {reason}: Level {old_level} → {mastery.level}")

            return Response({
                "success": True,
                "global_xp": profile.xp,
                "mastery_update": mastery_info
            })
            
        except Exception as e:
            logger.exception(f"❌ Erro ao salvar score: {str(e)}")
            return Response({
                "error": f"Erro ao processar resultado: {str(e)}"
            }, status=500)


class MyMasteryListView(generics.ListAPIView):
    """Lista todos os tópicos que o usuário já jogou"""
    permission_classes = [IsAuthenticated]
    serializer_class = MasterySerializer
    
    def get_queryset(self):
        return TopicMastery.objects.filter(
            user=self.request.user
        ).order_by('-level', 'topic')


class LeaderboardView(generics.ListAPIView):
    """Top 10 jogadores globais por XP"""
    permission_classes = [IsAuthenticated]
    serializer_class = LeaderboardSerializer
    
    def get_queryset(self):
        return PlayerProfile.objects.select_related('user').order_by('-xp')[:10]