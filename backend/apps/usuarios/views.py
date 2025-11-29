from rest_framework import permissions, status, viewsets, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, UsuarioSerializer
from .models import Usuario
from .permissions import IsAdminOrReadOnly
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, format=None):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Usuario.objects.all().order_by("-created_at")
    serializer_class = UsuarioSerializer

# --- CORREÇÃO AQUI ---
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    # "postmessage" é a string mágica para o fluxo auth-code com React
    callback_url = "postmessage" 
    client_class = OAuth2Client