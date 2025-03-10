from django.urls import path
from .views import (
    GetUserView, TripListCreateView, TripDetailView, DriverLogCreateBulkView,
    UserLogsView, UserHOSSummaryView, UpdateHOSView,SignupView,LoginView
)
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('user/<int:user_id>/', GetUserView.as_view(), name='get-user'),
    
    # Trip endpoints
    path('user/<int:user_id>/trips/', TripListCreateView.as_view(), name='user-trips'),
    path('trip/<int:trip_id>/', TripDetailView.as_view(), name='trip-detail'),
    
    # Log endpoints
    path('trip/<int:trip_id>/logs/', DriverLogCreateBulkView.as_view(), name='trip-logs-create'),
    path('user/<int:user_id>/logs/', UserLogsView.as_view(), name='user-logs'),
    
    # HOS endpoints
    path('user/<int:user_id>/hos/', UserHOSSummaryView.as_view(), name='user-hos'),
    path('user/<int:user_id>/hos/update/', UpdateHOSView.as_view(), name='update-hos'),

    # Auth endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name = 'token_refresh'),
]