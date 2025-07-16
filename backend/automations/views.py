from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Automation
from .serializers import AutomationSerializer


class AutomationViewSet(viewsets.ModelViewSet):
    """
    A viewset for handling CRUD operations on Automation objects.
    """
    queryset = Automation.objects.all()
    serializer_class = AutomationSerializer
    lookup_field = 'air_id'
    
    def get_queryset(self):
        """
        Optionally restricts the returned automations by filtering
        against a `search` query parameter in the URL.
        """
        queryset = Automation.objects.all()
        search = self.request.query_params.get('search')
        
        if search:
            queryset = queryset.filter(
                Q(air_id__icontains=search) |
                Q(name__icontains=search) |
                Q(type__icontains=search) |
                Q(brief_description__icontains=search) |
                Q(coe_fed__icontains=search) |
                Q(complexity__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """
        Create a new automation.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing automation.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an automation.
        """
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple automations at once.
        """
        if not isinstance(request.data, list):
            return Response(
                {'error': 'Expected a list of automation objects'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """
        Delete multiple automations at once.
        """
        air_ids = request.data.get('air_ids', [])
        if not air_ids:
            return Response(
                {'error': 'No AIR IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = Automation.objects.filter(air_id__in=air_ids).delete()[0]
        return Response(
            {'message': f'Deleted {deleted_count} automations'}, 
            status=status.HTTP_200_OK
        )
