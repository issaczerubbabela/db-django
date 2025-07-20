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
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('slide'); // 'slide' or 'tab'
  const [isImporting, setIsImporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null); // { airId, field }
  const [editingValue, setEditingValue] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    complexity: '',
    coe_fed: '',
    hasDescription: '',
    dateRange: ''
  });
  const fileInputRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
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
    // Clear search results when filters change
    setShowSearchResults(false);
    setSearchResults(null);
  }, [filters]); // Remove searchTerm from dependencies to avoid clearing on search

  // Debounced search functionality
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm.trim());
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
        setIsSearching(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    console.log(`🔍 Starting search for: "${query}"`);
    
    try {
      const response = await fetch(`/api/automations/search?q=${encodeURIComponent(query)}&limit=50&fuzzy=true`);
      if (response.ok) {
        const data = await response.json();
        
        // Enhanced debug logging
        console.log('📊 Full Search Response:', data);
        console.log('✅ Exact matches:', data.exact_matches?.length || 0, data.exact_matches?.map(m => m.air_id));
        console.log('🔄 Fuzzy matches:', data.fuzzy_matches?.length || 0, data.fuzzy_matches?.map(m => m.air_id));
        console.log('📈 Total count:', data.total_count || 0);
        
        setSearchResults(data);
        setShowSearchResults(true);
        
        // Auto-open sidebar for the most relevant result
        if (data && (data.exact_matches?.length > 0 || data.fuzzy_matches?.length > 0)) {
          const topResult = data.exact_matches?.[0] || data.fuzzy_matches?.[0];
          if (topResult) {
            console.log('📌 Auto-opening sidebar for:', topResult.air_id);
            setSelectedAutomation(topResult);
            setIsSidebarOpen(true);
          }
        }
      } else {
        console.error('❌ Search failed with status:', response.status);
        setSearchResults(null);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('❗ Search error:', error);
      setSearchResults(null);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    setShowSearchResults(false);
    setIsSearching(false);
    // Close sidebar if it was opened for a search result
    if (selectedAutomation && searchResults) {
      const searchResultIds = new Set([
        ...(searchResults.exact_matches || []).map(item => item.air_id),
        ...(searchResults.fuzzy_matches || []).map(item => item.air_id)
      ]);
      if (searchResultIds.has(selectedAutomation.air_id)) {
        setIsSidebarOpen(false);
        setSelectedAutomation(null);
      }
    }
  };

  const handleSearchResultClick = (automation) => {
    setSelectedAutomation(automation);
    setIsSidebarOpen(true);
    setShowSearchResults(false);
  };

  // Helper function to render text without highlighting
  const renderText = (text) => {
    return text || '';
  };

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

  const parseCsvData = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse CSV with proper handling of quoted fields containing commas
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);
    const automations = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      console.log(`Line ${i} values count: ${values.length}, headers count: ${headers.length}`);
      
      if (values.length === headers.length) {
        const automation = {};
        headers.forEach((header, index) => {
          // Direct field mapping - headers should match database fields exactly
          automation[header] = values[index] || '';
        });
        
        // Validate and clean the automation data
        const cleanedAutomation = {
          air_id: automation.air_id?.trim() || '',
          name: automation.name?.trim() || '',
          type: automation.type?.trim() || '',
          brief_description: automation.brief_description?.trim() || null,
          coe_fed: automation.coe_fed?.trim() || null,
          complexity: automation.complexity?.trim() || null,
          // Combine tool and tool_version into tool_version field since DB doesn't have separate tool field
          tool_version: automation.tool_version?.trim() || automation.tool?.trim() || null,
          process_details: automation.process_details?.trim() || null,
          object_details: automation.object_details?.trim() || null,
          queue: automation.queue?.trim() || null,
          shared_folders: automation.shared_folders?.trim() || null,
          shared_mailboxes: automation.shared_mailboxes?.trim() || null,
          qa_handshake: automation.qa_handshake?.trim() || null,
          preprod_deploy_date: automation.preprod_deploy_date?.trim() || null,
          prod_deploy_date: automation.prod_deploy_date?.trim() || null,
          warranty_end_date: automation.warranty_end_date?.trim() || null,
          comments: automation.comments?.trim() || null,
          documentation: automation.documentation?.trim() || null,
          modified: automation.modified?.trim() || null,
          // Skip modified_by since DB expects modified_by_id (foreign key)
          path: automation.path?.trim() || null,
          // Initialize empty arrays/objects for related data
          people: [],
          environments: [],
          test_data: {},
          metrics: {},
          artifacts: {}
        };
        
        console.log('Cleaned automation:', cleanedAutomation);
        
        // Ensure required fields exist and are not empty
        if (cleanedAutomation.air_id && cleanedAutomation.name && cleanedAutomation.type) {
          automations.push(cleanedAutomation);
        } else {
          console.warn(`Skipping automation on line ${i}: missing required fields`, {
            air_id: cleanedAutomation.air_id,
            name: cleanedAutomation.name,
            type: cleanedAutomation.type
          });
        }
      } else {
        console.warn(`Line ${i} has ${values.length} values but expected ${headers.length}`);
      }
    }
    return automations;
  };

  const handleCsvImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      console.log('CSV text length:', text.length);
      console.log('First 200 characters:', text.substring(0, 200));
      
      const csvAutomations = parseCsvData(text);
      console.log('Parsed automations:', csvAutomations.length);
      console.log('First automation:', csvAutomations[0]);
      
      if (csvAutomations.length === 0) {
        alert('No valid automation data found in CSV. Please check that the CSV has the correct headers and data format.');
        return;
      }

      // Import automations one by one
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (const automation of csvAutomations) {
        try {
          console.log('Importing automation:', automation.air_id);
          const response = await fetch('/api/automations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(automation),
          });

          if (response.ok) {
            successCount++;
            console.log('Successfully imported:', automation.air_id);
          } else {
            errorCount++;
            const errorText = await response.text();
            console.error('Failed to import:', automation.air_id, 'Error:', errorText);
            errors.push(`${automation.air_id}: ${errorText}`);
          }
        } catch (error) {
          errorCount++;
          console.error('Error importing automation:', automation.air_id, error);
          errors.push(`${automation.air_id}: ${error.message}`);
        }
      }

      // Refresh the automations list
      await fetchAutomations();
      
      let message = `Successfully imported ${successCount} out of ${csvAutomations.length} automations`;
      if (errorCount > 0) {
        message += `\n\nErrors encountered:\n${errors.slice(0, 3).join('\n')}`;
        if (errors.length > 3) {
          message += `\n... and ${errors.length - 3} more errors`;
        }
      }
      alert(message);
      
    } catch (error) {
      console.error('Error reading CSV file:', error);
      alert('Error reading CSV file');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  // Determine which automations to show based on search results or normal filtering
  const getDisplayAutomations = () => {
    // If we have search results, prioritize them regardless of filters
    if (searchResults && searchTerm) {
      // Get all search result IDs for easy lookup
      const searchResultIds = new Set([
        ...(searchResults.exact_matches || []).map(item => item.air_id),
        ...(searchResults.fuzzy_matches || []).map(item => item.air_id)
      ]);
      
      // Combine exact and fuzzy matches, preserving order (exact first)
      let searchMatches = [...(searchResults.exact_matches || []), ...(searchResults.fuzzy_matches || [])];
      
      // If we have active filters, apply them to search results
      if (Object.values(filters).some(filter => filter !== '')) {
        searchMatches = searchMatches.filter(automation => {
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
          
          // Date range filter
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
          
          return matchesType && matchesComplexity && matchesCoeFed && matchesDescription && matchesDateRange;
        });
      }
      
      // If no filters, also include other automations not in search results
      if (Object.values(filters).every(filter => filter === '')) {
        const otherAutomations = (Array.isArray(automations) ? automations : [])
          .filter(automation => !searchResultIds.has(automation.air_id));
        return [...searchMatches, ...otherAutomations];
      }
      
      // Return only search matches when filters are active
      return searchMatches;
    }
    
    // Otherwise, use normal filtering with search term as a simple text filter
    return (Array.isArray(automations) ? automations : []).filter(automation => {
      // Search term filter (basic text search when not using FTS)
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
  };

  const filteredAutomations = getDisplayAutomations();

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
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 text-black rounded-md leading-5 bg-white placeholder-black-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {/* Clear search button */}
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Search Status */}
                    {isSearching && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-sm border border-gray-200 z-30 p-3">
                        <span className="flex items-center text-sm text-gray-600">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </span>
                      </div>
                    )}
                    
                    {/* Search Results Summary */}
                    {!isSearching && searchResults && searchTerm && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-sm border border-gray-200 z-30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Found {searchResults.total_count} result{searchResults.total_count !== 1 ? 's' : ''} for &ldquo;{searchResults.query}&rdquo;
                            {searchResults.exact_matches?.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {searchResults.exact_matches.length} exact
                              </span>
                            )}
                            {searchResults.fuzzy_matches?.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                {searchResults.fuzzy_matches.length} similar
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => {
                              setSearchResults(null);
                              setShowSearchResults(false);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
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
                        {filteredAutomations.map((automation) => {
                          return (
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
                                {isEditing(automation.air_id, 'air_id') ? (
                                  renderEditableCell(automation, 'air_id', automation.air_id, 'font-medium text-blue-600')
                                ) : (
                                  <div 
                                    className="cursor-pointer hover:bg-blue-50 p-1 rounded group font-medium text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEdit(automation.air_id, 'air_id', automation.air_id);
                                    }}
                                    title="Click to edit"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                        {renderText(automation.air_id)}
                                      </span>
                                      <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {isEditing(automation.air_id, 'name') ? (
                                  renderEditableCell(automation, 'name', automation.name, 'text-gray-900 font-medium')
                                ) : (
                                  <div 
                                    className="cursor-pointer hover:bg-blue-50 p-1 rounded group text-gray-900 font-medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEdit(automation.air_id, 'name', automation.name);
                                    }}
                                    title="Click to edit"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                        {renderText(automation.name)}
                                      </span>
                                      <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {renderEditableCell(automation, 'type', automation.type, 'text-gray-500')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isEditing(automation.air_id, 'complexity') ? (
                                  renderEditableCell(automation, 'complexity', automation.complexity)
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
                                          {automation.complexity}
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
                                {isEditing(automation.air_id, 'brief_description') ? (
                                  renderEditableCell(automation, 'brief_description', automation.brief_description, 'text-gray-500 max-w-md truncate')
                                ) : (
                                  <div 
                                    className="cursor-pointer hover:bg-blue-50 p-1 rounded group text-gray-500 max-w-md truncate"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEdit(automation.air_id, 'brief_description', automation.brief_description);
                                    }}
                                    title="Click to edit"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`${automation.brief_description ? '' : 'text-gray-400 italic'}`}>
                                        {automation.brief_description ? (
                                          renderText(automation.brief_description)
                                        ) : (
                                          'Click to add...'
                                        )}
                                      </span>
                                      <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
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
                          );
                        })}
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
                  {/* Import Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      disabled={isImporting}
                      className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Import automations from CSV, Excel, or JSON"
                    >
                      <DocumentArrowUpIcon className="h-4 w-4 mr-1" />
                      {isImporting ? 'Importing...' : 'Import'}
                    </button>
                  </div>
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
              searchTerm={searchTerm}
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
        onImport={fetchAutomations}
        existingAutomations={automations}
      />
    </div>
  );
}
