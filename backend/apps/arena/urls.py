from django.urls import path
from .views import GenerateQuizView, SubmitScoreView, LeaderboardView, MyMasteryListView

urlpatterns = [
    path('battle/start/', GenerateQuizView.as_view(), name='arena-start'),
    path('battle/submit/', SubmitScoreView.as_view(), name='arena-submit'),
    path('leaderboard/', LeaderboardView.as_view(), name='arena-leaderboard'),
    path('my-mastery/', MyMasteryListView.as_view(), name='my-mastery'), 
]