'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ViewColumnsIcon, RectangleStackIcon, PlusIcon, TrashIcon, FunnelIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { 
  UserIcon, 
  ComputerDesktopIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  LinkIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function AutomationTabView({ 
  automations, 
  loading, 
  onViewTypeChange, 
  onAddAutomation, 
  onDeleteAutomation,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  getUniqueValues,
  getUniqueRoleValues,
  getUniqueEnvironmentValues,
  getUniqueModifiedByValues,
  getUniqueTestDataValues,
  allAutomations,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onExport,
  showExportDropdown,
  onToggleExportDropdown,
  // Import props
  onImport,
  isImporting,
  // Editing props
  editingCell,
  editingValue,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditValueChange,
  onKeyPress,
  isEditing,
  // Enhanced search props (for sidebar display only)
  searchResults,
  isSearching,
  showSearchResults,
  onClearSearch,
  renderEditableCell
}) {
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Remove sidebar search state - now using global search
  // const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  // const [searchResults, setSearchResults] = useState(null);
  // const [isSearching, setIsSearching] = useState(false);
  // const [showSearchResults, setShowSearchResults] = useState(false);

  // Set first automation as selected when automations load
  useEffect(() => {
    if (automations.length > 0 && !selectedAutomation) {
      setSelectedAutomation(automations[0]);
    }
  }, [automations, selectedAutomation]);

  // Enhanced search result click handler with tab navigation for sidebar clicks
  const handleSearchResultClick = (automation) => {
    setSelectedAutomation(automation);
    // Determine which tab to navigate to based on search term
    const relevantTab = determineRelevantTab(automation, searchTerm);
    setActiveTab(relevantTab);
  };

  const determineRelevantTab = (automation, searchTerm) => {
    if (!searchTerm || !automation) return 'basic';
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Field mappings for tabs
    const fieldMappings = {
      'basic': [
        'air_id', 'name', 'type', 'complexity', 'coe_fed', 'queue', 
        'brief_description', 'process_details', 'object_details'
      ],
      'tool': [
        'tool', 'tool_version', 'shared_folders', 'shared_mailboxes', 'documentation'
      ],
      'team': [
        'people', 'test_data'
      ],
      'environments': [
        'environments'
      ],
      'dates': [
        'preprod_deploy_date', 'prod_deploy_date', 'modified', 'modified_by'
      ],
      'metrics': [
        'metrics', 'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate'
      ],
      'artifacts': [
        'artifacts', 'artifacts_link', 'code_review', 'demo', 'rampup_issue_list', 'comments'
      ]
    };
    
    // Check direct field matches first
    for (const [tabId, fields] of Object.entries(fieldMappings)) {
      for (const field of fields) {
        if (field.includes(lowerSearchTerm) || lowerSearchTerm.includes(field)) {
          return tabId;
        }
      }
    }
    
    // Check field content matches
    for (const [tabId, fields] of Object.entries(fieldMappings)) {
      for (const field of fields) {
        const fieldValue = getFieldValue(automation, field);
        if (fieldValue && fieldValue.toLowerCase().includes(lowerSearchTerm)) {
          return tabId;
        }
      }
    }
    
    // Default to basic tab
    return 'basic';
  };

  const getMatchedFieldHint = (automation, searchTerm) => {
    if (!searchTerm || !automation) return null;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Check specific fields for matches
    const fieldChecks = [
      { field: 'air_id', tab: 'basic', label: 'AIR ID' },
      { field: 'name', tab: 'basic', label: 'Name' },
      { field: 'type', tab: 'basic', label: 'Type' },
      { field: 'complexity', tab: 'basic', label: 'Complexity' },
      { field: 'brief_description', tab: 'basic', label: 'Description' },
      { field: 'tool', tab: 'tool', label: 'Tool' },
      { field: 'tool_version', tab: 'tool', label: 'Tool Version' },
      { field: 'documentation', tab: 'tool', label: 'Documentation' },
      { field: 'comments', tab: 'artifacts', label: 'Comments' },
      { field: 'coe_fed', tab: 'basic', label: 'COE/FED' }
    ];
    
    for (const check of fieldChecks) {
      const fieldValue = automation[check.field];
      if (fieldValue && fieldValue.toLowerCase().includes(lowerSearchTerm)) {
        return { field: check.label, tab: check.tab };
      }
    }
    
    return null;
  };

  const getTabDisplayName = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab ? tab.name : 'Basic Information';
  };

  const getFieldValue = (automation, fieldPath) => {
    try {
      // Handle nested object paths
      const parts = fieldPath.split('.');
      let value = automation;
      
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return null;
        }
      }
      
      // Handle arrays (for people, environments, etc.)
      if (Array.isArray(value)) {
        return value.map(item => {
          if (typeof item === 'object') {
            return Object.values(item).join(' ');
          }
          return String(item);
        }).join(' ');
      }
      
      // Handle objects (for metrics, artifacts, etc.)
      if (value && typeof value === 'object') {
        return Object.values(value).join(' ');
      }
      
      return value ? String(value) : null;
    } catch (error) {
      return null;
    }
  };

  // Determine which automations to show in sidebar based on global search results or normal filtering
  const getSidebarAutomations = () => {
    // If we have active global search results, show search results with match type info
    if (showSearchResults && searchResults && searchResults.total_count > 0) {
      const exactMatches = (searchResults.exact_matches || []).map(automation => ({
        ...automation,
        matchType: 'exact'
      }));
      const fuzzyMatches = (searchResults.fuzzy_matches || []).map(automation => ({
        ...automation,
        matchType: 'fuzzy'
      }));
      return [...exactMatches, ...fuzzyMatches];
    }
    
    // Otherwise use the simple filter for sidebar (no match type)
    return automations.filter(automation =>
      automation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.air_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(automation => ({
      ...automation,
      matchType: 'simple'
    }));
  };

  const getAutomationCardStyles = (automation) => {
    const isSelected = selectedAutomation?.air_id === automation.air_id;
    
    // Base styles
    let styles = 'p-3 rounded-md cursor-pointer transition-colors ';
    
    if (isSelected) {
      // Selected state overrides match type colors
      styles += 'bg-blue-50 border border-blue-200';
    } else {
      // Different colors based on match type
      switch (automation.matchType) {
        case 'exact':
          styles += 'hover:bg-green-50 border-l-4 border-l-green-500';
          break;
        case 'fuzzy':
          styles += 'hover:bg-yellow-50 border-l-4 border-l-yellow-500';
          break;
        case 'simple':
          styles += 'hover:bg-gray-50 border-l-4 border-l-gray-300';
          break;
        default:
          styles += 'hover:bg-gray-50';
      }
    }
    
    return styles;
  };

  const getMatchTypeIndicator = (automation) => {
    if (!automation.matchType || automation.matchType === 'simple') return null;
    
    switch (automation.matchType) {
      case 'exact':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Exact Match
          </span>
        );
      case 'fuzzy':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Similar Match
          </span>
        );
      default:
        return null;
    }
  };

  const filteredSidebarAutomations = getSidebarAutomations();

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: DocumentTextIcon },
    { id: 'tool', name: 'Tool Information', icon: CogIcon },
    { id: 'team', name: 'Team Members', icon: UserIcon },
    { id: 'environments', name: 'Environments', icon: ComputerDesktopIcon },
    { id: 'dates', name: 'Timeline', icon: ClockIcon },
    { id: 'metrics', name: 'Metrics', icon: ChartBarIcon },
    { id: 'artifacts', name: 'Artifacts', icon: LinkIcon },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTabContent = () => {
    if (!selectedAutomation) return null;

    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">AIR ID</label>
                <p className="text-lg font-semibold text-blue-600">{selectedAutomation.air_id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Automation Name</label>
                <p className="text-lg font-semibold text-gray-900">{selectedAutomation.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <p className="text-gray-900">{selectedAutomation.type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Complexity</label>
                {selectedAutomation.complexity ? (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(selectedAutomation.complexity)}`}>
                    {selectedAutomation.complexity}
                  </span>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">COE/FED</label>
                <p className="text-gray-900">{selectedAutomation.coe_fed || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Queue</label>
                <p className="text-gray-900">{selectedAutomation.queue || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Brief Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedAutomation.brief_description || 'No description available'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Process Details</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedAutomation.process_details || 'No process details available'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Object Details</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedAutomation.object_details || 'No object details available'}
              </p>
            </div>
          </div>
        );

      case 'tool':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tool</label>
                <p className="text-gray-900">{selectedAutomation.tool || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tool Version</label>
                <p className="text-gray-900">{selectedAutomation.tool_version || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Shared Folders</label>
                <p className="text-gray-900">{selectedAutomation.shared_folders || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Shared Mailboxes</label>
                <p className="text-gray-900">{selectedAutomation.shared_mailboxes || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Documentation</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedAutomation.documentation || 'No documentation available'}
              </p>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            {selectedAutomation.people && selectedAutomation.people.length > 0 ? (
              <div className="space-y-4">
                {selectedAutomation.people.map((person, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{person.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{person.role || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No team members assigned</p>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Test Data SPOC</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedAutomation.test_data?.spoc || 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'environments':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Environments</h3>
            {selectedAutomation.environments && selectedAutomation.environments.length > 0 ? (
              <div className="space-y-4">
                {selectedAutomation.environments.map((env, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <p className="text-sm text-gray-900">{env.type || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">VDI</label>
                        <p className="text-sm text-gray-900">{env.vdi || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Service Account</label>
                        <p className="text-sm text-gray-900">{env.service_account || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No environments configured</p>
            )}
          </div>
        );

      case 'dates':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Pre-Prod Deploy Date</label>
                <p className="text-gray-900">{formatDate(selectedAutomation.preprod_deploy_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Prod Deploy Date</label>
                <p className="text-gray-900">{formatDate(selectedAutomation.prod_deploy_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Modified Date</label>
                <p className="text-gray-900">{formatDate(selectedAutomation.modified)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Modified By</label>
                <p className="text-gray-900">{selectedAutomation.modified_by || 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Total Cases</label>
                <p className="text-2xl font-semibold text-gray-900">
                  {selectedAutomation.metrics?.post_prod_total_cases || '0'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">System Exceptions</label>
                <p className="text-2xl font-semibold text-red-600">
                  {selectedAutomation.metrics?.post_prod_sys_ex_count || '0'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Success Rate</label>
                <p className="text-2xl font-semibold text-green-600">
                  {selectedAutomation.metrics?.post_prod_success_rate ? 
                    `${selectedAutomation.metrics.post_prod_success_rate}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'artifacts':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Artifacts Link</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedAutomation.artifacts?.artifacts_link || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Code Review</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedAutomation.artifacts?.code_review || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Demo</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedAutomation.artifacts?.demo || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Ramp-up Issue List</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedAutomation.artifacts?.rampup_issue_list || 'N/A'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Comments</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {selectedAutomation.comments || 'No comments available'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Automation List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Automation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSidebarAutomations.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredSidebarAutomations.map((automation) => {
                const matchHint = getMatchedFieldHint(automation, searchTerm);
                const targetTab = determineRelevantTab(automation, searchTerm);
                return (
                  <div
                    key={automation.air_id}
                    onClick={() => {
                      // Use enhanced click handler for search results, simple handler for regular filtering
                      if (showSearchResults && searchResults && searchResults.total_count > 0) {
                        handleSearchResultClick(automation);
                      } else {
                        setSelectedAutomation(automation);
                      }
                    }}
                    className={getAutomationCardStyles(automation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {automation.name}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {automation.air_id}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {automation.type}
                        </div>
                        {/* Show match hint for search results */}
                        {matchHint && showSearchResults && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {matchHint.field} → {getTabDisplayName(targetTab)}
                            </span>
                          </div>
                        )}
                      </div>
                      {getMatchTypeIndicator(automation) && (
                        <div className="ml-2 flex-shrink-0">
                          {getMatchTypeIndicator(automation)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {automations.length === 0 
                ? 'No automations available'
                : 'No automations match your search'
              }
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        {selectedAutomation && (
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {selectedAutomation.name}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {selectedAutomation.air_id}
                </span>
                <button
                  onClick={() => onDeleteAutomation(selectedAutomation.air_id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                  title="Delete automation"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <nav className="flex space-x-8 px-4" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedAutomation ? (
            renderTabContent()
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select an automation to view details</p>
            </div>
          )}
        </div>

        {/* Bottom Bar - consistent with slide view */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">
                Showing {filteredSidebarAutomations.length} of {automations.length} automations
                {hasActiveFilters && (
                  <span className="text-blue-600 ml-1">(filtered)</span>
                )}
                {searchResults && searchTerm && (
                  <span className="text-purple-600 ml-1">
                    • Search: {searchResults.total_count} result{searchResults.total_count !== 1 ? 's' : ''}
                    {searchResults.exact_matches?.length > 0 && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {searchResults.exact_matches.length} exact
                      </span>
                    )}
                    {searchResults.fuzzy_matches?.length > 0 && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {searchResults.fuzzy_matches.length} similar
                      </span>
                    )}
                  </span>
                )}
                {selectedItems.size > 0 && (
                  <span className="text-green-600 ml-1">• {selectedItems.size} selected</span>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
