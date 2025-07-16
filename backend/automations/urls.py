from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutomationViewSet

router = DefaultRouter()
router.register(r'automations', AutomationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
