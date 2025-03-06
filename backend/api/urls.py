from django.urls import path
from .views import GetUserView

urlpatterns = [
    path('user/<int:user_id>/', GetUserView.as_view(), name='get-user'),
]