from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Automation, AuditLog
from .serializers import AutomationSerializer, AutomationCreateSerializer, AuditLogSerializer
from .search import AutomationSearchService
from .audit import log_audit_event, get_object_changes


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
        Create a new automation with nested data support.
        """
        serializer = AutomationCreateSerializer(data=request.data)
        if serializer.is_valid():
            automation = serializer.save()
            
            # Log audit event
            log_audit_event(
                action='create',
                object_type='Automation',
                object_id=automation.air_id,
                object_name=automation.name,
                request=request,
                details={'automation_type': automation.type}
            )
            
            # Return the created automation using the read serializer
            response_serializer = AutomationSerializer(automation)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing automation.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Get old data for audit logging
        old_serializer = AutomationSerializer(instance)
        old_data = old_serializer.data
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            updated_automation = serializer.save()
            
            # Get new data and log changes
            new_serializer = AutomationSerializer(updated_automation)
            new_data = new_serializer.data
            changes = get_object_changes(old_data, new_data)
            
            log_audit_event(
                action='update',
                object_type='Automation',
                object_id=updated_automation.air_id,
                object_name=updated_automation.name,
                request=request,
                details=changes
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an automation.
        """
        instance = self.get_object()
        
        # Log audit event before deletion
        log_audit_event(
            action='delete',
            object_type='Automation',
            object_id=instance.air_id,
            object_name=instance.name,
            request=request,
            details={'automation_type': instance.type}
        )
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple automations at once with nested data support.
        """
        if not isinstance(request.data, list):
            return Response(
                {'error': 'Expected a list of automation objects'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AutomationCreateSerializer(data=request.data, many=True)
        if serializer.is_valid():
            automations = serializer.save()
            
            # Log bulk creation audit event
            log_audit_event(
                action='bulk_create',
                object_type='Automation',
                object_name=f'Bulk import of {len(automations)} automations',
                request=request,
                details={
                    'count': len(automations),
                    'air_ids': [auto.air_id for auto in automations]
                }
            )
            
            # Return the created automations using the read serializer
            response_serializer = AutomationSerializer(automations, many=True)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Advanced search endpoint using FTS5 and fuzzy matching.
        """
        query = request.query_params.get('q', '').strip()
        limit = min(int(request.query_params.get('limit', 50)), 100)  # Max 100 results
        include_fuzzy = request.query_params.get('fuzzy', 'true').lower() == 'true'
        
        if not query:
            return Response({
                'exact_matches': [],
                'fuzzy_matches': [],
                'suggestions': [],
                'total_count': 0,
                'query': query
            })
        
        try:
            results = AutomationSearchService.search(
                query=query,
                limit=limit,
                include_fuzzy=include_fuzzy
            )
            
            # Log search audit event
            log_audit_event(
                action='search',
                object_type='Automation',
                request=request,
                details={
                    'query': query,
                    'results_count': results.get('total_count', 0),
                    'include_fuzzy': include_fuzzy
                }
            )
            
            results['query'] = query
            return Response(results)
        
        except Exception as e:
            return Response(
                {'error': f'Search failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        
        # Get automation names before deletion for audit log
        automations_to_delete = list(Automation.objects.filter(air_id__in=air_ids).values('air_id', 'name'))
        
        deleted_count = Automation.objects.filter(air_id__in=air_ids).delete()[0]
        
        # Log bulk deletion audit event
        log_audit_event(
            action='delete',
            object_type='Automation',
            object_name=f'Bulk deletion of {deleted_count} automations',
            request=request,
            details={
                'count': deleted_count,
                'deleted_automations': automations_to_delete
            }
        )
        
        return Response(
            {'message': f'Deleted {deleted_count} automations'}, 
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'], url_path='audit-logs')
    def automation_audit_logs(self, request, air_id=None):
        """
        Get audit logs for a specific automation.
        """
        try:
            limit = min(int(request.query_params.get('limit', 50)), 200)
            
            audit_logs = AuditLog.objects.filter(object_id=air_id)[:limit]
            serializer = AuditLogSerializer(audit_logs, many=True)
            
            return Response({
                'audit_logs': serializer.data,
                'total_count': AuditLog.objects.filter(object_id=air_id).count(),
                'limit': limit,
                'automation_id': air_id
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch audit logs for {air_id}: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='audit-logs')
    def audit_logs(self, request):
        """
        Get audit logs for the database actions.
        """
        try:
            limit = min(int(request.query_params.get('limit', 100)), 500)  # Max 500 results
            object_type = request.query_params.get('object_type', '')
            action = request.query_params.get('action', '')
            
            queryset = AuditLog.objects.all()
            
            if object_type:
                queryset = queryset.filter(object_type__icontains=object_type)
            if action:
                queryset = queryset.filter(action=action)
                
            audit_logs = queryset[:limit]
            serializer = AuditLogSerializer(audit_logs, many=True)
            
            return Response({
                'audit_logs': serializer.data,
                'total_count': queryset.count(),
                'limit': limit
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch audit logs: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
