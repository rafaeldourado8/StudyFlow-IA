from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserJourney
from .serializers import UserJourneySerializer
from .curriculum import SAGA_DATA, get_level_data
from apps.arena.services import ArenaService
from apps.arena.models import PlayerProfile

class JourneyMapView(APIView):
    """
    Retorna o mapa completo (estático) + o progresso do usuário (dinâmico)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        journey, _ = UserJourney.objects.get_or_create(user=request.user)
        # Usando o serializer para formatar os dados do progresso
        serializer = UserJourneySerializer(journey)
        
        return Response({
            "worlds": SAGA_DATA,
            "progress": serializer.data
        })

class StartLevelView(APIView):
    """
    Gera o Quiz específico para o nível selecionado usando a IA
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        level_id = request.data.get('level_id')
        level_data, world_data, is_boss = get_level_data(level_id)
        
        if not level_data:
            return Response({"error": "Nível não encontrado"}, status=404)

        # Configura o contexto do Prompt para a IA
        role_title = world_data.get('role', 'Dev').upper()
        
        if is_boss:
            prompt_topic = (
                f"Você é o BOSS FINAL do nível {role_title}. "
                f"O desafio é sobre: {level_data['topic']}. "
                f"Crie perguntas difíceis baseadas em cenários de falha real."
            )
            difficulty = "hard"
        else:
            prompt_topic = (
                f"Treinamento para se tornar {role_title}. "
                f"Tópico da aula: {level_data['topic']}."
            )
            difficulty = "medium"

        # Reutiliza o serviço da Arena para gerar o JSON das perguntas
        service = ArenaService()
        game_data = service.generate_quiz(topic=prompt_topic, difficulty=difficulty)
        
        # Injeta metadados da jornada para o Frontend saber o que fazer ao vencer
        game_data['journey_meta'] = {
            'level_id': level_id,
            'is_boss': is_boss,
            'world_id': world_data['id']
        }
        
        return Response(game_data)

class CompleteLevelView(APIView):
    """
    Registra a vitória, desbloqueia o próximo nível e dá XP
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        level_id = request.data.get('level_id')
        passed = request.data.get('passed', False)
        
        if not passed:
            return Response({"success": False, "message": "Nível não completado."})

        # Busca o progresso
        journey, _ = UserJourney.objects.get_or_create(user=request.user)
        level_data, world_data, is_boss = get_level_data(level_id)

        if not level_data:
            return Response({"error": "Nível inválido"}, status=400)

        # Verifica se é a primeira vez que completa (para não dar XP infinito)
        first_clear = level_id not in journey.completed_levels
        
        if first_clear:
            journey.completed_levels.append(level_id)
            
            # Lógica de Avanço
            if is_boss:
                # Se matou o Boss, vai para o próximo mundo e reseta o nível
                journey.current_world_index += 1
                journey.current_level_index = 0
            else:
                # Se passou de nível normal, apenas avança
                journey.current_level_index += 1
            
            journey.save()
            
            # Recompensa de XP
            profile, _ = PlayerProfile.objects.get_or_create(user=request.user)
            xp_reward = 500 if is_boss else 150
            profile.add_xp(xp_reward)
            
            return Response({
                "success": True,
                "first_clear": True,
                "xp_gained": xp_reward,
                "new_progress": journey.current_level_index
            })

        return Response({
            "success": True,
            "first_clear": False,
            "xp_gained": 0,
            "message": "Nível já completado anteriormente."
        })