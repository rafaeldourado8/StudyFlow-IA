from django.urls import path
from .views import AskTutorView, AnalyzeTaskView

urlpatterns = [
    path('ask/', AskTutorView.as_view(), name='ask-tutor'),
    path('analyze/', AnalyzeTaskView.as_view(), name='analyze-task'), # Rota nova
]