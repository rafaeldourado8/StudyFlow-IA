from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, MeAPIView, RegisterView

router = DefaultRouter()
router.register(r"users", UsuarioViewSet, basename="usuario")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/me/", MeAPIView.as_view(), name="auth_me"),
    path("auth/register/", RegisterView.as_view(), name="auth_register"), 
]