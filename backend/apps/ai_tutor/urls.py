from django.urls import path
from .views import AskTutorView
urlpatterns = [path('ask/', AskTutorView.as_view(), name='ask-tutor')]