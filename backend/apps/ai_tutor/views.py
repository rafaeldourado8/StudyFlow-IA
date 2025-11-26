from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import AskTutorSerializer
from .services import AIService
from .models import TutorInteraction

class AskTutorView(APIView):
    """View original para o Chat"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AskTutorSerializer(data=request.data)
        if serializer.is_valid():
            q = serializer.validated_data['question']
            s = serializer.validated_data.get('subject', 'Geral')
            
            service = AIService()
            answer = service.get_pedagogical_answer(q, s)
            
            if "Erro:" not in answer:
                TutorInteraction.objects.create(user=request.user, subject=s, question=q, answer=answer)
            
            return Response({"answer": answer})
        return Response(serializer.errors, status=400)

class AnalyzeTaskView(APIView):
    """
    NOVA VIEW: Responsável por gerar a análise estruturada antes de criar a tarefa.
    Não salva no banco 'TutorInteraction' para não poluir o histórico do chat,
    pois o resultado será salvo na descrição da Task.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic')
        depth = request.data.get('depth', 'initial') # 'initial' ou 'deep'

        if not topic:
            return Response({"error": "O campo 'topic' é obrigatório."}, status=400)

        service = AIService()
        data = service.analyze_topic(topic, depth)

        if "error" in data:
            return Response(data, status=500)

        return Response(data)