from django.urls import path
from .views import JourneyMapView, StartLevelView, CompleteLevelView

urlpatterns = [
    path('map/', JourneyMapView.as_view(), name='journey_map'),
    path('start/', StartLevelView.as_view(), name='journey_start'),
    path('complete/', CompleteLevelView.as_view(), name='journey_complete'),
]