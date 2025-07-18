'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ViewColumnsIcon, RectangleStackIcon, DocumentArrowUpIcon, TrashIcon, FunnelIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import AutomationDetailsSidebar from './AutomationDetailsSidebar';
import AutomationForm from './AutomationForm';
import AutomationFormComplete from './AutomationFormComplete';
import AutomationTabView from './AutomationTabView';
import ImportModal from './ImportModal';

export default function AutomationDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('slide'); // 'slide' or 'tab'
  const [isImporting, setIsImporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null); // { airId, field }
  const [editingValue, setEditingValue] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [filters, setFilters] = useState({
    type: '',
    complexity: '',
    coe_fed: '',
    hasDescription: '',
    dateRange: ''
  });
  const filterDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const importDropdownRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (importDropdownRef.current && !importDropdownRef.current.contains(event.target)) {
        setShowImportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedItems(new Set());
  }, [searchTerm, filters]);

  // Clear selections when view changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [viewType]);

  // Fetch automations from API
  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/automations');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setAutomations(data);
        } else {
          console.error('API returned non-array data:', data);
          setAutomations([]);
        }
      } else {
        console.error('Failed to fetch automations');
        setAutomations([]);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
      setAutomations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async (automationData) => {
    try {
      const response = await fetch('/api/automations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(automationData),
      });

      if (response.ok) {
        const newAutomation = await response.json();
        setAutomations(prev => [newAutomation, ...prev]);
        setIsFormOpen(false);
      } else {
        console.error('Failed to create automation');
      }
    } catch (error) {
      console.error('Error creating automation:', error);
    }
  };

  const handleDeleteAutomation = async (airId) => {
    if (!confirm(`Are you sure you want to delete automation ${airId}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/automations/${airId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setAutomations(prev => prev.filter(automation => automation.air_id !== airId));
        
        // Close sidebar if the deleted automation was selected
        if (selectedAutomation?.air_id === airId) {
          setIsSidebarOpen(false);
          setSelectedAutomation(null);
        }
        
        console.log(`Automation ${airId} deleted successfully`);
      } else {
        const error = await response.text();
        console.error('Failed to delete automation:', error);
        alert(`Failed to delete automation: ${error}`);
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
      alert('Error deleting automation');
    }
  };

  // Enhanced import function that handles both new records and updates
  const handleEnhancedImport = async (records, analysis) => {
    setIsImporting(true);
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    try {
      // Process new records
      for (const record of analysis.newRecords) {
        try {
          // Clean the record data before sending
          const cleanRecord = { ...record };
          delete cleanRecord._index;
          
          const response = await fetch('/api/automations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanRecord),
          });

          if (response.ok) {
            results.created++;
          } else {
            const errorText = await response.text();
            results.errors.push(`Failed to create ${record.air_id}: ${errorText}`);
          }
        } catch (error) {
          results.errors.push(`Error creating ${record.air_id}: ${error.message}`);
        }
      }

      // Process updates
      for (const record of analysis.existing) {
        try {
          // Only send changed fields
          const updateData = {};
          Object.keys(record._changes || {}).forEach(field => {
            updateData[field] = record[field];
          });

          if (Object.keys(updateData).length > 0) {
            const response = await fetch(`/api/automations/${record.air_id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
            });

            if (response.ok) {
              results.updated++;
            } else {
              const errorText = await response.text();
              results.errors.push(`Failed to update ${record.air_id}: ${errorText}`);
            }
          }
        } catch (error) {
          results.errors.push(`Error updating ${record.air_id}: ${error.message}`);
        }
      }

      // Refresh the automations list
      await fetchAutomations();

      // Show results
      let message = `Import completed:\n`;
      message += `• ${results.created} new records created\n`;
      message += `• ${results.updated} existing records updated`;
      
      if (results.errors.length > 0) {
        message += `\n\nErrors (${results.errors.length}):\n`;
        message += results.errors.slice(0, 3).join('\n');
        if (results.errors.length > 3) {
          message += `\n... and ${results.errors.length - 3} more errors`;
        }
      }
      
      alert(message);

    } catch (error) {
      console.error('Import error:', error);
      alert('An error occurred during import');
    } finally {
      setIsImporting(false);
    }
  };

  // Import handlers for different formats
  const handleImportWithFormat = (format) => {
    setImportFormat(format);
    setIsImportModalOpen(true);
    setShowImportDropdown(false);
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    const values = automations
      .map(automation => automation[field])
      .filter(value => value && value.trim())
      .map(value => value.trim());
    return [...new Set(values)].sort();
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      complexity: '',
      coe_fed: '',
      hasDescription: '',
      dateRange: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  // Export functionality
  const formatDataForExport = (data) => {
    return data.map(automation => ({
      'AIR ID': automation.air_id || '',
      'Name': automation.name || '',
      'Type': automation.type || '',
      'Complexity': automation.complexity || '',
      'Brief Description': automation.brief_description || '',
      'COE/FED': automation.coe_fed || '',
      'Tool': automation.tool_name || '',
      'Tool Version': automation.tool_version || '',
      'Process Details': automation.process_details || '',
      'Object Details': automation.object_details || '',
      'Queue': automation.queue || '',
      'Shared Folders': automation.shared_folders || '',
      'Shared Mailboxes': automation.shared_mailboxes || '',
      'QA Handshake': automation.qa_handshake || '',
      'PreProd Deploy Date': automation.preprod_deploy_date || '',
      'Prod Deploy Date': automation.prod_deploy_date || '',
      'Warranty End Date': automation.warranty_end_date || '',
      'Comments': automation.comments || '',
      'Documentation': automation.documentation || '',
      'Modified': automation.modified || '',
      'Modified By': automation.modified_by_name || '',
      'Path': automation.path || '',
      'Created At': automation.created_at || '',
      'Updated At': automation.updated_at || '',
      // People fields (flattened)
      'Project Manager': automation.people?.find(p => p.role === 'Project Manager')?.name || '',
      'Project Designer': automation.people?.find(p => p.role === 'Project Designer')?.name || '',
      'Developer': automation.people?.find(p => p.role === 'Developer')?.name || '',
      'Tester': automation.people?.find(p => p.role === 'Tester')?.name || '',
      'Business SPOC': automation.people?.find(p => p.role === 'Business SPOC')?.name || '',
      'Business Stakeholders': automation.people?.filter(p => p.role === 'Business Stakeholder').map(p => p.name).join('; ') || '',
      'Applications-App Owner': automation.people?.find(p => p.role === 'Applications-App Owner')?.name || '',
      // Environment fields (flattened)
      'Dev VDI': automation.environments?.find(e => e.type === 'Development')?.vdi || '',
      'Dev Service Account': automation.environments?.find(e => e.type === 'Development')?.service_account || '',
      'QA VDI': automation.environments?.find(e => e.type === 'QA')?.vdi || '',
      'QA Service Account': automation.environments?.find(e => e.type === 'QA')?.service_account || '',
      'Production VDI': automation.environments?.find(e => e.type === 'Production')?.vdi || '',
      'Production Service Account': automation.environments?.find(e => e.type === 'Production')?.service_account || '',
      // Test Data
      'Test Data SPOC': automation.test_data?.spoc || '',
      // Metrics
      'Post Production Total Cases': automation.metrics?.post_prod_total_cases || '',
      'Post Production System Exceptions Count': automation.metrics?.post_prod_sys_ex_count || '',
      'Post Production Success Rate': automation.metrics?.post_prod_success_rate || '',
      // Artifacts
      'Automation Artifacts Link': automation.artifacts?.artifacts_link || '',
      'Code Review with M&E': automation.artifacts?.code_review || '',
      'Automation Demo to M&E': automation.artifacts?.demo || '',
      'Rampup/Postprod Issue/Resolution list to M&E': automation.artifacts?.rampup_issue_list || ''
    }));
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data, filename) => {
    const formattedData = formatDataForExport(data);
    if (formattedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(formattedData[0]);
    const csvContent = [
      headers.join(','),
      ...formattedData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const exportToJSON = (data, filename) => {
    const formattedData = formatDataForExport(data);
    if (formattedData.length === 0) {
      alert('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(formattedData, null, 2);
    downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
  };

  const exportToExcel = (data, filename) => {
    const formattedData = formatDataForExport(data);
    if (formattedData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create a simple Excel-compatible format (tab-separated values)
    const headers = Object.keys(formattedData[0]);
    const excelContent = [
      headers.join('\t'),
      ...formattedData.map(row => 
        headers.map(header => row[header] || '').join('\t')
      )
    ].join('\n');

    downloadFile(excelContent, filename, 'application/vnd.ms-excel;charset=utf-8;');
  };

  const handleExport = (format, scope) => {
    let dataToExport = [];
    let filenamePrefix = '';

    switch (scope) {
      case 'selected':
        if (selectedItems.size === 0) {
          alert('No items selected for export');
          return;
        }
        dataToExport = filteredAutomations.filter(automation => 
          selectedItems.has(automation.air_id)
        );
        filenamePrefix = `automations_selected_${selectedItems.size}`;
        break;
      case 'filtered':
        dataToExport = filteredAutomations;
        filenamePrefix = hasActiveFilters || searchTerm 
          ? 'automations_filtered' 
          : 'automations_all';
        break;
      case 'all':
        dataToExport = automations;
        filenamePrefix = 'automations_all';
        break;
      default:
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `${filenamePrefix}_${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(dataToExport, `${filename}.csv`);
        break;
      case 'json':
        exportToJSON(dataToExport, `${filename}.json`);
        break;
      case 'excel':
        exportToExcel(dataToExport, `${filename}.xls`);
        break;
    }

    setShowExportDropdown(false);
  };

  // Selection functionality
  const handleSelectAll = () => {
    if (selectedItems.size === filteredAutomations.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAutomations.map(automation => automation.air_id)));
    }
  };

  const handleSelectItem = (airId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(airId)) {
      newSelected.delete(airId);
    } else {
      newSelected.add(airId);
    }
    setSelectedItems(newSelected);
  };

  const filteredAutomations = (Array.isArray(automations) ? automations : []).filter(automation => {
    // Search term filter
    const matchesSearch = !searchTerm || (
      automation.air_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.brief_description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Type filter
    const matchesType = !filters.type || automation.type?.toLowerCase() === filters.type.toLowerCase();

    // Complexity filter
    const matchesComplexity = !filters.complexity || automation.complexity?.toLowerCase() === filters.complexity.toLowerCase();

    // COE/FED filter
    const matchesCoeFed = !filters.coe_fed || automation.coe_fed?.toLowerCase() === filters.coe_fed.toLowerCase();

    // Has description filter
    const matchesDescription = !filters.hasDescription || 
      (filters.hasDescription === 'with' && automation.brief_description) ||
      (filters.hasDescription === 'without' && !automation.brief_description);

    // Date range filter (basic implementation)
    const matchesDateRange = !filters.dateRange || (() => {
      const now = new Date();
      const createdAt = automation.created_at ? new Date(automation.created_at) : null;
      if (!createdAt) return filters.dateRange === 'unknown';

      switch (filters.dateRange) {
        case 'today':
          return createdAt.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return createdAt >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return createdAt >= monthAgo;
        case 'unknown':
          return !automation.created_at;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesComplexity && matchesCoeFed && matchesDescription && matchesDateRange;
  });

  const handleRowClick = (automation) => {
    setSelectedAutomation(automation);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedAutomation(null);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity.toLowerCase()) {
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

  // Inline editing functionality
  const startEdit = (airId, field, currentValue) => {
    setEditingCell({ airId, field });
    setEditingValue(currentValue || '');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    try {
      const { airId, field } = editingCell;
      
      // Prepare the update data
      const updateData = {
        [field]: editingValue.trim()
      };

      const response = await fetch(`/api/automations/${airId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedAutomation = await response.json();
        
        // Update local state
        setAutomations(prev => 
          prev.map(automation => 
            automation.air_id === airId 
              ? { ...automation, ...updateData, updated_at: new Date().toISOString() }
              : automation
          )
        );

        // Update selected automation if it's the one being edited
        if (selectedAutomation?.air_id === airId) {
          setSelectedAutomation(prev => ({ ...prev, ...updateData }));
        }

        cancelEdit();
        console.log(`Field ${field} updated for automation ${airId}`);
      } else {
        const error = await response.text();
        console.error('Failed to update automation:', error);
        alert(`Failed to update: ${error}`);
      }
    } catch (error) {
      console.error('Error updating automation:', error);
      alert('Error updating automation');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const isEditing = (airId, field) => {
    return editingCell?.airId === airId && editingCell?.field === field;
  };

  const renderEditableCell = (automation, field, value, className = "") => {
    const isCurrentlyEditing = isEditing(automation.air_id, field);
    
    if (isCurrentlyEditing) {
      return (
        <div className="flex items-center space-x-1">
          {field === 'type' || field === 'complexity' || field === 'coe_fed' ? (
            <select
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={saveEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {field === 'type' && (
                <>
                  <option value="">Select type...</option>
                  {getUniqueValues('type').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </>
              )}
              {field === 'complexity' && (
                <>
                  <option value="">Select complexity...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </>
              )}
              {field === 'coe_fed' && (
                <>
                  <option value="">Select COE/FED...</option>
                  {getUniqueValues('coe_fed').map(coe => (
                    <option key={coe} value={coe}>{coe}</option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={saveEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            onClick={saveEdit}
            className="text-green-600 hover:text-green-800 p-1"
            title="Save"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={cancelEdit}
            className="text-red-600 hover:text-red-800 p-1"
            title="Cancel"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`cursor-pointer hover:bg-blue-50 p-1 rounded group ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          startEdit(automation.air_id, field, value);
        }}
        title="Click to edit"
      >
        <div className="flex items-center justify-between">
          <span className={value ? '' : 'text-gray-400 italic'}>
            {value || 'Click to add...'}
          </span>
          <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    );
  };

  // Search term highlighting utility
  const highlightSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark 
            key={index} 
            className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Enhanced editable cell renderer with search highlighting
  const renderEditableCellWithHighlight = (automation, field, value, className = "") => {
    const isCurrentlyEditing = isEditing(automation.air_id, field);
    
    if (isCurrentlyEditing) {
      return (
        <div className="flex items-center space-x-1">
          {field === 'type' || field === 'complexity' || field === 'coe_fed' ? (
            <select
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={saveEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {field === 'type' && (
                <>
                  <option value="">Select type...</option>
                  {getUniqueValues('type').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </>
              )}
              {field === 'complexity' && (
                <>
                  <option value="">Select complexity...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </>
              )}
              {field === 'coe_fed' && (
                <>
                  <option value="">Select COE/FED...</option>
                  {getUniqueValues('coe_fed').map(coe => (
                    <option key={coe} value={coe}>{coe}</option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={saveEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            onClick={saveEdit}
            className="text-green-600 hover:text-green-800 p-1"
            title="Save"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={cancelEdit}
            className="text-red-600 hover:text-red-800 p-1"
            title="Cancel"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    // Display value with search highlighting
    const displayValue = value || 'Click to add...';
    const highlightedValue = searchTerm.trim() ? highlightSearchTerm(displayValue, searchTerm) : displayValue;

    return (
      <div 
        className={`cursor-pointer hover:bg-blue-50 p-1 rounded group ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          startEdit(automation.air_id, field, value);
        }}
        title="Click to edit"
      >
        <div className="flex items-center justify-between">
          <span className={value ? '' : 'text-gray-400 italic'}>
            {highlightedValue}
          </span>
          <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {viewType === 'tab' ? (
        // Tab View
        <div className="w-full">
          <AutomationTabView 
            automations={filteredAutomations} 
            loading={loading} 
            onViewTypeChange={setViewType}
            onAddAutomation={() => setIsFormOpen(true)}
            onDeleteAutomation={handleDeleteAutomation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            showFilters={showFilters}
            onToggleFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            getUniqueValues={getUniqueValues}
            allAutomations={automations}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            onExport={handleExport}
            showExportDropdown={showExportDropdown}
            onToggleExportDropdown={setShowExportDropdown}
            editingCell={editingCell}
            editingValue={editingValue}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={saveEdit}
            onEditValueChange={setEditingValue}
            onKeyPress={handleKeyPress}
            isEditing={isEditing}
            renderEditableCell={renderEditableCell}
          />
        </div>
      ) : (
        // Slide View (Original)
        <>
          {/* Main Content Area */}
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-2/3' : 'w-full'}`}>
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Automation Database
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage and track automation records
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-md p-1">
                      <button
                        onClick={() => setViewType('slide')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewType === 'slide'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ViewColumnsIcon className="h-4 w-4 mr-2" />
                        Slide View
                      </button>
                      <button
                        onClick={() => setViewType('tab')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewType === 'tab'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <RectangleStackIcon className="h-4 w-4 mr-2" />
                        Tab View
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Automation
                    </button>

                    {/* Export Button */}
                    <div className="relative" ref={exportDropdownRef}>
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Export
                        <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Export Dropdown */}
                      {showExportDropdown && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                          <div className="p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
                            
                            {/* Export Scope */}
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">What to export:</h4>
                              <div className="space-y-2">
                                {selectedItems.size > 0 && (
                                  <button
                                    onClick={() => {}}
                                    className="w-full text-left px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                  >
                                    <div className="font-medium text-blue-900">Selected Items ({selectedItems.size})</div>
                                    <div className="text-blue-700">Export only selected automations</div>
                                  </button>
                                )}
                                <button
                                  onClick={() => {}}
                                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                  <div className="font-medium text-gray-900">
                                    {hasActiveFilters || searchTerm ? 'Filtered Results' : 'Current View'} ({filteredAutomations.length})
                                  </div>
                                  <div className="text-gray-700">
                                    {hasActiveFilters || searchTerm ? 'Export filtered/searched results' : 'Export all visible items'}
                                  </div>
                                </button>
                                <button
                                  onClick={() => {}}
                                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                  <div className="font-medium text-gray-900">All Data ({automations.length})</div>
                                  <div className="text-gray-700">Export complete database</div>
                                </button>
                              </div>
                            </div>

                            {/* Export Formats */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Export format:</h4>
                              <div className="grid grid-cols-3 gap-2">
                                {/* CSV Format */}
                                <div className="space-y-1">
                                  {selectedItems.size > 0 && (
                                    <button
                                      onClick={() => handleExport('csv', 'selected')}
                                      className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                      title="Export selected as CSV"
                                    >
                                      CSV
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleExport('csv', 'filtered')}
                                    className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    title="Export filtered/current view as CSV"
                                  >
                                    CSV
                                  </button>
                                  <button
                                    onClick={() => handleExport('csv', 'all')}
                                    className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    title="Export all data as CSV"
                                  >
                                    CSV
                                  </button>
                                </div>

                                {/* JSON Format */}
                                <div className="space-y-1">
                                  {selectedItems.size > 0 && (
                                    <button
                                      onClick={() => handleExport('json', 'selected')}
                                      className="w-full px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                      title="Export selected as JSON"
                                    >
                                      JSON
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleExport('json', 'filtered')}
                                    className="w-full px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                    title="Export filtered/current view as JSON"
                                  >
                                    JSON
                                  </button>
                                  <button
                                    onClick={() => handleExport('json', 'all')}
                                    className="w-full px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                    title="Export all data as JSON"
                                  >
                                    JSON
                                  </button>
                                </div>

                                {/* Excel Format */}
                                <div className="space-y-1">
                                  {selectedItems.size > 0 && (
                                    <button
                                      onClick={() => handleExport('excel', 'selected')}
                                      className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                      title="Export selected as Excel"
                                    >
                                      Excel
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleExport('excel', 'filtered')}
                                    className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    title="Export filtered/current view as Excel"
                                  >
                                    Excel
                                  </button>
                                  <button
                                    onClick={() => handleExport('excel', 'all')}
                                    className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    title="Export all data as Excel"
                                  >
                                    Excel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Import Button */}
                    <div className="relative" ref={importDropdownRef}>
                      <button
                        onClick={() => setShowImportDropdown(!showImportDropdown)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                        Import
                        <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showImportDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Import Dropdown */}
                      {showImportDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                          <div className="p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
                            
                            <div className="space-y-2">
                              <button
                                onClick={() => handleImportWithFormat('auto')}
                                className="w-full text-left px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                              >
                                <div className="font-medium text-blue-900">Import from File</div>
                                <div className="text-blue-700 text-xs">CSV, JSON, or Excel files</div>
                              </button>
                              
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-2">Download Templates:</div>
                                <div className="grid grid-cols-3 gap-1">
                                  <button
                                    onClick={() => {
                                      // CSV template download
                                      const templateFields = [
                                        'air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity',
                                        'tool_name', 'tool_version', 'process_details', 'object_details', 'queue',
                                        'shared_folders', 'shared_mailboxes', 'qa_handshake',
                                        'preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date',
                                        'comments', 'documentation', 'modified', 'modified_by_name', 'path',
                                        // People roles (flattened)
                                        'project_manager', 'project_designer', 'developer', 'tester',
                                        'business_spoc', 'business_stakeholder', 'app_owner',
                                        // Environments (flattened)
                                        'dev_vdi', 'dev_service_account', 'qa_vdi', 'qa_service_account',
                                        'uat_vdi', 'uat_service_account', 'prod_vdi', 'prod_service_account',
                                        // Test Data
                                        'test_data_spoc',
                                        // Metrics
                                        'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate',
                                        // Artifacts
                                        'artifacts_link', 'code_review', 'demo', 'rampup_issue_list'
                                      ];
                                      const csvContent = templateFields.join(',') + '\n' + templateFields.map(field => {
                                        const sampleData = {
                                          air_id: 'AIR-2024-001',
                                          name: 'Sample Automation Process',
                                          type: 'RPA',
                                          brief_description: 'Automated invoice processing system',
                                          coe_fed: 'Finance',
                                          complexity: 'Medium',
                                          tool_name: 'UiPath',
                                          tool_version: '2023.10',
                                          process_details: 'Processes invoices from email attachments',
                                          object_details: 'PDF extraction and validation',
                                          queue: 'Invoice_Processing_Queue',
                                          shared_folders: '\\\\server\\automation\\invoices',
                                          shared_mailboxes: 'automation.invoices@company.com',
                                          qa_handshake: 'Yes',
                                          preprod_deploy_date: '2024-01-15',
                                          prod_deploy_date: '2024-01-30',
                                          warranty_end_date: '2024-12-31',
                                          comments: 'Requires daily monitoring',
                                          documentation: 'https://docs.company.com/automation/air-2024-001',
                                          modified: '2024-01-30',
                                          modified_by_name: 'John Doe',
                                          path: 'C:\\Automations\\InvoiceProcessing',
                                          // People roles
                                          project_manager: 'Alice Smith',
                                          project_designer: 'Bob Johnson',
                                          developer: 'Carol Davis',
                                          tester: 'David Wilson',
                                          business_spoc: 'Eva Brown',
                                          business_stakeholder: 'Frank Miller',
                                          app_owner: 'Grace Taylor',
                                          // Environments
                                          dev_vdi: 'DEV-VDI-001',
                                          dev_service_account: 'svc_automation_dev',
                                          qa_vdi: 'QA-VDI-001',
                                          qa_service_account: 'svc_automation_qa',
                                          uat_vdi: 'UAT-VDI-001',
                                          uat_service_account: 'svc_automation_uat',
                                          prod_vdi: 'PROD-VDI-001',
                                          prod_service_account: 'svc_automation_prod',
                                          // Test Data
                                          test_data_spoc: 'Test Manager',
                                          // Metrics
                                          post_prod_total_cases: '1000',
                                          post_prod_sys_ex_count: '5',
                                          post_prod_success_rate: '99.5',
                                          // Artifacts
                                          artifacts_link: 'https://artifacts.company.com/air-2024-001',
                                          code_review: 'Completed',
                                          demo: 'https://demo.company.com/air-2024-001',
                                          rampup_issue_list: 'https://issues.company.com/air-2024-001'
                                        };
                                        return sampleData[field] || '';
                                      }).join(',');
                                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = 'automation_template.csv';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                      setShowImportDropdown(false);
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    CSV
                                  </button>
                                  <button
                                    onClick={() => {
                                      // JSON template download
                                      const sampleData = {
                                        air_id: 'AIR-2024-001',
                                        name: 'Sample Automation Process',
                                        type: 'RPA',
                                        brief_description: 'Automated invoice processing system',
                                        coe_fed: 'Finance',
                                        complexity: 'Medium',
                                        tool_name: 'UiPath',
                                        tool_version: '2023.10',
                                        process_details: 'Processes invoices from email attachments',
                                        object_details: 'PDF extraction and validation',
                                        queue: 'Invoice_Processing_Queue',
                                        shared_folders: '\\\\server\\automation\\invoices',
                                        shared_mailboxes: 'automation.invoices@company.com',
                                        qa_handshake: 'Yes',
                                        preprod_deploy_date: '2024-01-15',
                                        prod_deploy_date: '2024-01-30',
                                        warranty_end_date: '2024-12-31',
                                        comments: 'Requires daily monitoring',
                                        documentation: 'https://docs.company.com/automation/air-2024-001',
                                        modified: '2024-01-30',
                                        modified_by_name: 'John Doe',
                                        path: 'C:\\Automations\\InvoiceProcessing',
                                        // People roles (flattened for import)
                                        project_manager: 'Alice Smith',
                                        project_designer: 'Bob Johnson',
                                        developer: 'Carol Davis',
                                        tester: 'David Wilson',
                                        business_spoc: 'Eva Brown',
                                        business_stakeholder: 'Frank Miller',
                                        app_owner: 'Grace Taylor',
                                        // Environments (flattened for import)
                                        dev_vdi: 'DEV-VDI-001',
                                        dev_service_account: 'svc_automation_dev',
                                        qa_vdi: 'QA-VDI-001',
                                        qa_service_account: 'svc_automation_qa',
                                        uat_vdi: 'UAT-VDI-001',
                                        uat_service_account: 'svc_automation_uat',
                                        prod_vdi: 'PROD-VDI-001',
                                        prod_service_account: 'svc_automation_prod',
                                        // Test Data
                                        test_data_spoc: 'Test Manager',
                                        // Metrics
                                        post_prod_total_cases: 1000,
                                        post_prod_sys_ex_count: 5,
                                        post_prod_success_rate: 99.5,
                                        // Artifacts
                                        artifacts_link: 'https://artifacts.company.com/air-2024-001',
                                        code_review: 'Completed',
                                        demo: 'https://demo.company.com/air-2024-001',
                                        rampup_issue_list: 'https://issues.company.com/air-2024-001'
                                      };
                                      const jsonContent = JSON.stringify([sampleData], null, 2);
                                      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = 'automation_template.json';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                      setShowImportDropdown(false);
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    JSON
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Excel template download
                                      const templateFields = [
                                        'air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity',
                                        'tool_name', 'tool_version', 'process_details', 'object_details', 'queue',
                                        'shared_folders', 'shared_mailboxes', 'qa_handshake',
                                        'preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date',
                                        'comments', 'documentation', 'modified', 'modified_by_name', 'path',
                                        // People roles (flattened)
                                        'project_manager', 'project_designer', 'developer', 'tester',
                                        'business_spoc', 'business_stakeholder', 'app_owner',
                                        // Environments (flattened)
                                        'dev_vdi', 'dev_service_account', 'qa_vdi', 'qa_service_account',
                                        'uat_vdi', 'uat_service_account', 'prod_vdi', 'prod_service_account',
                                        // Test Data
                                        'test_data_spoc',
                                        // Metrics
                                        'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate',
                                        // Artifacts
                                        'artifacts_link', 'code_review', 'demo', 'rampup_issue_list'
                                      ];
                                      const excelContent = templateFields.join('\t') + '\n' + templateFields.map(field => {
                                        const sampleData = {
                                          air_id: 'AIR-2024-001',
                                          name: 'Sample Automation Process',
                                          type: 'RPA',
                                          brief_description: 'Automated invoice processing system',
                                          coe_fed: 'Finance',
                                          complexity: 'Medium',
                                          tool_name: 'UiPath',
                                          tool_version: '2023.10',
                                          process_details: 'Processes invoices from email attachments',
                                          object_details: 'PDF extraction and validation',
                                          queue: 'Invoice_Processing_Queue',
                                          shared_folders: '\\\\server\\automation\\invoices',
                                          shared_mailboxes: 'automation.invoices@company.com',
                                          qa_handshake: 'Yes',
                                          preprod_deploy_date: '2024-01-15',
                                          prod_deploy_date: '2024-01-30',
                                          warranty_end_date: '2024-12-31',
                                          comments: 'Requires daily monitoring',
                                          documentation: 'https://docs.company.com/automation/air-2024-001',
                                          modified: '2024-01-30',
                                          modified_by_name: 'John Doe',
                                          path: 'C:\\Automations\\InvoiceProcessing',
                                          // People roles
                                          project_manager: 'Alice Smith',
                                          project_designer: 'Bob Johnson',
                                          developer: 'Carol Davis',
                                          tester: 'David Wilson',
                                          business_spoc: 'Eva Brown',
                                          business_stakeholder: 'Frank Miller',
                                          app_owner: 'Grace Taylor',
                                          // Environments
                                          dev_vdi: 'DEV-VDI-001',
                                          dev_service_account: 'svc_automation_dev',
                                          qa_vdi: 'QA-VDI-001',
                                          qa_service_account: 'svc_automation_qa',
                                          uat_vdi: 'UAT-VDI-001',
                                          uat_service_account: 'svc_automation_uat',
                                          prod_vdi: 'PROD-VDI-001',
                                          prod_service_account: 'svc_automation_prod',
                                          // Test Data
                                          test_data_spoc: 'Test Manager',
                                          // Metrics
                                          post_prod_total_cases: '1000',
                                          post_prod_sys_ex_count: '5',
                                          post_prod_success_rate: '99.5',
                                          // Artifacts
                                          artifacts_link: 'https://artifacts.company.com/air-2024-001',
                                          code_review: 'Completed',
                                          demo: 'https://demo.company.com/air-2024-001',
                                          rampup_issue_list: 'https://issues.company.com/air-2024-001'
                                        };
                                        return sampleData[field] || '';
                                      }).join('\t');
                                      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = 'automation_template.xls';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                      setShowImportDropdown(false);
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    Excel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="px-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search automations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 text-black rounded-md leading-5 bg-white placeholder-black-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Filter Button */}
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                        hasActiveFilters 
                          ? 'border-blue-500 text-blue-600 bg-blue-50' 
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <FunnelIcon className="h-4 w-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {Object.values(filters).filter(f => f !== '').length}
                        </span>
                      )}
                      <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Filter Dropdown */}
                    {showFilters && (
                      <div ref={filterDropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                            {hasActiveFilters && (
                              <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            {/* Type Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                              <select
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All types</option>
                                {getUniqueValues('type').map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Complexity Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                              <select
                                value={filters.complexity}
                                onChange={(e) => setFilters({...filters, complexity: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All complexities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            
                            {/* COE/FED Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">COE/FED</label>
                              <select
                                value={filters.coe_fed}
                                onChange={(e) => setFilters({...filters, coe_fed: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All COE/FED</option>
                                {getUniqueValues('coe_fed').map(coe => (
                                  <option key={coe} value={coe}>{coe}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Description Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <select
                                value={filters.hasDescription}
                                onChange={(e) => setFilters({...filters, hasDescription: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All</option>
                                <option value="with">With description</option>
                                <option value="without">Without description</option>
                              </select>
                            </div>
                            
                            {/* Date Range Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                              <select
                                value={filters.dateRange}
                                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All time</option>
                                <option value="today">Today</option>
                                <option value="week">Past week</option>
                                <option value="month">Past month</option>
                                <option value="unknown">Unknown date</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <div className="px-6 py-4">
                {loading ? (
                  <div className="bg-white shadow rounded-lg p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-4">Loading automations...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={filteredAutomations.length > 0 && selectedItems.size === filteredAutomations.length}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            AIR ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Automation Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Complexity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAutomations.map((automation) => (
                          <tr 
                            key={automation.air_id}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedAutomation?.air_id === automation.air_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            } ${
                              selectedItems.has(automation.air_id) ? 'bg-blue-25' : ''
                            }`}
                            onClick={() => handleRowClick(automation)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(automation.air_id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectItem(automation.air_id);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {renderEditableCellWithHighlight(automation, 'air_id', automation.air_id, 'font-medium text-blue-600')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {renderEditableCellWithHighlight(automation, 'name', automation.name, 'text-gray-900 font-medium')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {renderEditableCellWithHighlight(automation, 'type', automation.type, 'text-gray-500')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing(automation.air_id, 'complexity') ? (
                                renderEditableCellWithHighlight(automation, 'complexity', automation.complexity)
                              ) : (
                                <div 
                                  className="cursor-pointer hover:bg-blue-50 p-1 rounded group"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(automation.air_id, 'complexity', automation.complexity);
                                  }}
                                  title="Click to edit"
                                >
                                  <div className="flex items-center justify-between">
                                    {automation.complexity ? (
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(automation.complexity)}`}>
                                        {searchTerm.trim() ? highlightSearchTerm(automation.complexity, searchTerm) : automation.complexity}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 italic">Click to add...</span>
                                    )}
                                    <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                              {renderEditableCellWithHighlight(automation, 'brief_description', automation.brief_description, 'text-gray-500 max-w-md truncate')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAutomation(automation.air_id);
                                  }}
                                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                                  title="Delete automation"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredAutomations.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          {automations.length === 0 
                            ? 'No automations found. Click "Add Automation" to create your first one.'
                            : 'No automations found matching your search.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-500">
                    Showing {filteredAutomations.length} of {automations.length} automations
                    {hasActiveFilters && (
                      <span className="text-blue-600 ml-1">(filtered)</span>
                    )}
                    {selectedItems.size > 0 && (
                      <span className="text-green-600 ml-1">• {selectedItems.size} selected</span>
                    )}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-1/3' : 'w-0'} overflow-hidden`}>
            <AutomationDetailsSidebar
              isOpen={isSidebarOpen}
              onClose={closeSidebar}
              automation={selectedAutomation}
              onDeleteAutomation={handleDeleteAutomation}
            />
          </div>
        </>
      )}

      {/* Form Modal */}
      <AutomationFormComplete
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateAutomation}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleEnhancedImport}
        existingAutomations={automations}
        defaultFormat={importFormat}
      />
    </div>
  );
}
