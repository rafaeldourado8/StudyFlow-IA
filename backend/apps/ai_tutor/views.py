from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import AskTutorSerializer
from .services import AIService
from .models import TutorInteraction

class AskTutorView(APIView):
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