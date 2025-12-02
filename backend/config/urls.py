from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from apps.usuarios.views import MyTokenObtainPairView, GoogleLogin

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- ADICIONE ESTA LINHA ---
    # Necessário para o allauth resolver rotas internas como 'socialaccount_signup'
    path('accounts/', include('allauth.urls')), 
    # ---------------------------

    # Auth
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # Apps Endpoints
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/ai/', include('apps.ai_tutor.urls')),
    path('api/users/', include('apps.usuarios.urls')),
    path('prometheus/', include('django_prometheus.urls')),
    path('api/arena/', include('apps.arena.urls')),
    path('api/journey/', include('apps.journey.urls')),
]