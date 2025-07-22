'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ClockIcon, 
  UserIcon, 
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AuditLog = ({ isOpen, onToggle }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    object_type: '',
    limit: 100
  });

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.object_type) params.append('object_type', filters.object_type);
      params.append('limit', filters.limit.toString());

      const url = `/api/automations/audit_logs?${params}`;
      console.log('Fetching audit logs from:', url);
      
      const response = await fetch(url);
      console.log('Audit logs response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Audit logs data:', data);
        setAuditLogs(data.audit_logs || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch audit logs:', response.status, errorText);
        setError('Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Error fetching audit logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen, fetchAuditLogs]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return <PlusIcon className="h-4 w-4 text-green-600" />;
      case 'update':
        return <PencilIcon className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <TrashIcon className="h-4 w-4 text-red-600" />;
      case 'import':
      case 'bulk_create':
        return <DocumentArrowUpIcon className="h-4 w-4 text-purple-600" />;
      case 'export':
        return <DocumentArrowDownIcon className="h-4 w-4 text-orange-600" />;
      case 'search':
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-600" />;
      case 'view':
        return <EyeIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'text-green-700 bg-green-50';
      case 'update':
        return 'text-blue-700 bg-blue-50';
      case 'delete':
        return 'text-red-700 bg-red-50';
      case 'import':
      case 'bulk_create':
        return 'text-purple-700 bg-purple-50';
      case 'export':
        return 'text-orange-700 bg-orange-50';
      case 'search':
        return 'text-gray-700 bg-gray-50';
      case 'view':
        return 'text-gray-700 bg-gray-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const formatDetails = (details) => {
    if (!details) return null;
    
    if (details.changed_fields) {
      const fieldCount = Object.keys(details.changed_fields).length;
      return `${fieldCount} field${fieldCount > 1 ? 's' : ''} changed`;
    }
    
    if (details.count !== undefined) {
      return `${details.count} item${details.count > 1 ? 's' : ''}`;
    }
    
    if (details.query) {
      return `Search: "${details.query}" (${details.results_count || 0} results)`;
    }
    
    if (details.automation_type) {
      return `Type: ${details.automation_type}`;
    }
    
    return null;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now - logTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return logTime.toLocaleDateString();
  };

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  const uniqueObjectTypes = [...new Set(auditLogs.map(log => log.object_type))];

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        title="View Audit Log"
      >
        <ClockIcon className="h-4 w-4" />
        <span>Audit Log</span>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronUpIcon className="h-4 w-4" />
        )}
      </button>

      {/* Audit Log Panel */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Database Audit Log</h3>
            
            {/* Filters */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filters.object_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, object_type: e.target.value }))}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">All Types</option>
                  {uniqueObjectTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                  <option value={200}>200 entries</option>
                </select>
                
                <button
                  onClick={fetchAuditLogs}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Audit Log Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <span className="mt-2 block">Loading audit logs...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                <span>{error}</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No audit logs found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action_display}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.object_type}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-900">
                          {log.object_name || log.object_id || 'Unknown object'}
                        </div>
                        
                        {formatDetails(log.details) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDetails(log.details)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(log.timestamp)}
                          </span>
                          {log.user_ip && (
                            <span className="text-xs text-gray-400">
                              {log.user_ip}
                            </span>
                          )}
                        </div>
                        
                        {/* Expandable details */}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                          >
                            {expandedLog === log.id ? 'Hide details' : 'Show details'}
                          </button>
                        )}
                        
                        {/* Expanded details */}
                        {expandedLog === log.id && log.details && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <pre className="whitespace-pre-wrap text-gray-700">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
