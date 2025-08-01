'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ViewColumnsIcon, RectangleStackIcon, DocumentArrowUpIcon, TrashIcon, FunnelIcon, DocumentArrowDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, ChevronDownIcon as ChevronDownSolid } from '@heroicons/react/20/solid';
import AutomationDetailsSidebar from './AutomationDetailsSidebar';
import AutomationForm from './AutomationForm';
import AutomationFormComplete from './AutomationFormComplete';
import AutomationTabView from './AutomationTabView';
import ImportModal from './ImportModal';
import SharedHeader from './SharedHeader';
import AuditLog from './AuditLog';

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
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [filters, setFilters] = useState({
    // Basic fields
    type: '',
    complexity: '',
    coe_fed: '',
    hasDescription: '',
    
    // Tool fields
    tool_name: '',
    tool_version: '',
    
    // Process fields
    queue: '',
    qa_handshake: '',
    
    // Modified by
    modified_by: '',
    
    // People roles
    project_manager: '',
    developer: '',
    tester: '',
    business_spoc: '',
    
    // Date filters
    preprod_deploy_date: { type: '', value: '' },
    prod_deploy_date: { type: '', value: '' },
    warranty_end_date: { type: '', value: '' },
    modified: { type: '', value: '' },
    created_at: { type: '', value: '' },
    updated_at: { type: '', value: '' },
    
    // Environment filters
    dev_vdi: '',
    qa_vdi: '',
    prod_vdi: '',
    dev_service_account: '',
    qa_service_account: '',
    prod_service_account: '',
    
    // Metrics filters
    post_prod_success_rate: { type: '', value: '' },
    post_prod_total_cases: { type: '', value: '' },
    
    // Artifacts filters
    code_review: '',
    demo: '',
    
    // Test data
    test_data_spoc: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
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
    // Clear sorting when filters change
    setSortConfig({ key: null, direction: 'asc' });
  }, [filters]); // Remove searchTerm from dependencies to avoid clearing on search

  // Clear selections and sorting when search term changes
  useEffect(() => {
    setSelectedItems(new Set());
    // Clear sorting when search changes
    setSortConfig({ key: null, direction: 'asc' });
  }, [searchTerm]);

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
      const response = await fetch(`/api/automations/search/?q=${encodeURIComponent(query)}&limit=50&fuzzy=true`);
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
      const response = await fetch('/api/automations/');
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
      const response = await fetch('/api/automations/', {
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
      const response = await fetch(`/api/automations/${airId}/`, {
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
    // Helper function to parse dates
    const parseDate = (dateStr) => {
      if (!dateStr || !dateStr.trim()) return null;
      const trimmed = dateStr.trim();
      if (trimmed === '') return null;
      
      try {
        // Handle ISO date format (e.g., "2024-01-15T09:30:00Z")
        const date = new Date(trimmed);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      } catch (error) {
        console.warn('Failed to parse date:', trimmed);
        return null;
      }
    };

    // Use a more robust CSV parser that handles quoted fields with newlines and commas
    const parseCSV = (csvText) => {
      const rows = [];
      let currentRow = [];
      let currentField = '';
      let insideQuotes = false;
      let i = 0;
      
      while (i < csvText.length) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
          if (insideQuotes && nextChar === '"') {
            // Escaped quote - add one quote to field
            currentField += '"';
            i += 2;
            continue;
          } else if (insideQuotes) {
            // End quote
            insideQuotes = false;
          } else {
            // Start quote
            insideQuotes = true;
          }
        } else if (char === ',' && !insideQuotes) {
          // Field separator
          currentRow.push(currentField.trim());
          currentField = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
          // Row separator
          if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
          }
          // Skip \r\n combination
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
        } else {
          currentField += char;
        }
        i++;
      }
      
      // Add final field and row if there's content
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field !== '')) {
          rows.push(currentRow);
        }
      }
      
      return rows;
    };

    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      console.warn('CSV must have at least header row and one data row');
      return [];
    }

    const headers = rows[0];
    console.log('📋 CSV Headers:', headers.length, 'headers found');
    console.log('🏷️  First 5 headers:', headers.slice(0, 5));
    const automations = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      console.log(`📝 Line ${i}: parsed ${values.length} values (expected ${headers.length})`);
      
      if (values.length === headers.length) {
        const automation = {};
        headers.forEach((header, index) => {
          automation[header] = values[index] || '';
        });
        
        // Log the raw extracted values for debugging
        console.log(`🔍 Line ${i} field extraction:`, {
          'AIR ID': `"${automation['AIR ID']}"`,
          'Name': `"${automation['Name']}"`,
          'Type': `"${automation['Type']}"`
        });
        
        // Map CSV headers to expected field names
        const fieldMapping = {
          'AIR ID': 'air_id',
          'Name': 'name',
          'Type': 'type',
          'Brief Description': 'brief_description',
          'COE/FED': 'coe_fed',
          'Complexity': 'complexity',
          'Tool': 'tool_name',
          'Tool Version': 'tool_version',
          'Process Details': 'process_details',
          'Object Details': 'object_details',
          'Queue': 'queue',
          'Shared Folders': 'shared_folders',
          'Shared Mailboxes': 'shared_mailboxes',
          'QA Handshake': 'qa_handshake',
          'PreProd Deploy Date': 'preprod_deploy_date',
          'Prod Deploy Date': 'prod_deploy_date',
          'Warranty End Date': 'warranty_end_date',
          'Comments': 'comments',
          'Documentation': 'documentation',
          'Modified': 'modified',
          'Modified By': 'modified_by_name',
          'Path': 'path',
          'Created At': 'created_at',
          'Updated At': 'updated_at',
          'Project Manager': 'project_manager',
          'Project Designer': 'project_designer',
          'Developer': 'developer',
          'Tester': 'tester',
          'Business SPOC': 'business_spoc',
          'Business Stakeholders': 'business_stakeholders',
          'Applications-App Owner': 'app_owner',
          'Dev VDI': 'dev_vdi',
          'Dev Service Account': 'dev_service_account',
          'QA VDI': 'qa_vdi',
          'QA Service Account': 'qa_service_account',
          'Production VDI': 'production_vdi',
          'Production Service Account': 'production_service_account',
          'Test Data SPOC': 'test_data_spoc',
          'Post Production Total Cases': 'post_prod_total_cases',
          'Post Production System Exceptions Count': 'post_prod_sys_ex_count',
          'Post Production Success Rate': 'post_prod_success_rate',
          'Automation Artifacts Link': 'artifacts_link',
          'Code Review with M&E': 'code_review',
          'Automation Demo to M&E': 'demo',
          'Rampup/Postprod Issue/Resolution list to M&E': 'rampup_issue_list'
        };

        // Build the comprehensive automation object with all fields
        const cleanedAutomation = {
          // Core fields
          air_id: automation['AIR ID']?.trim() || '',
          name: automation['Name']?.trim() || '',
          type: automation['Type']?.trim() || '',
          brief_description: automation['Brief Description']?.trim() || null,
          coe_fed: automation['COE/FED']?.trim() || null,
          complexity: automation['Complexity']?.trim() || null,
          tool_version: automation['Tool Version']?.trim() || null,
          process_details: automation['Process Details']?.trim() || null,
          object_details: automation['Object Details']?.trim() || null,
          queue: automation['Queue']?.trim() || null,
          shared_folders: automation['Shared Folders']?.trim() || null,
          shared_mailboxes: automation['Shared Mailboxes']?.trim() || null,
          qa_handshake: automation['QA Handshake']?.trim() || null,
          preprod_deploy_date: parseDate(automation['PreProd Deploy Date']),
          prod_deploy_date: parseDate(automation['Prod Deploy Date']),
          warranty_end_date: parseDate(automation['Warranty End Date']),
          comments: automation['Comments']?.trim() || null,
          documentation: automation['Documentation']?.trim() || null,
          modified: parseDate(automation['Modified']),
          path: automation['Path']?.trim() || null,
          
          // Tool name for backend processing
          tool_name: automation['Tool']?.trim() || null,
          
          // Build nested data structures for related models
          people_data: [],
          environments_data: [],
          test_data_data: {},
          metrics_data: {},
          artifacts_data: {}
        };
        
        // Parse people data from role fields
        const peopleRoles = [];
        
        // Add people with their roles based on CSV data
        if (automation['Project Manager']?.trim()) {
          peopleRoles.push({ 
            role: 'project_manager', 
            name: automation['Project Manager'].trim() 
          });
        }
        if (automation['Project Designer']?.trim()) {
          peopleRoles.push({ 
            role: 'project_designer', 
            name: automation['Project Designer'].trim() 
          });
        }
        if (automation['Developer']?.trim()) {
          peopleRoles.push({ 
            role: 'developer', 
            name: automation['Developer'].trim() 
          });
        }
        if (automation['Tester']?.trim()) {
          peopleRoles.push({ 
            role: 'tester', 
            name: automation['Tester'].trim() 
          });
        }
        if (automation['Business SPOC']?.trim()) {
          peopleRoles.push({ 
            role: 'business_spoc', 
            name: automation['Business SPOC'].trim() 
          });
        }
        if (automation['Applications-App Owner']?.trim()) {
          peopleRoles.push({ 
            role: 'app_owner', 
            name: automation['Applications-App Owner'].trim() 
          });
        }
        
        // Handle Business Stakeholders (might be multiple, separated by semicolon)
        if (automation['Business Stakeholders']?.trim()) {
          const stakeholders = automation['Business Stakeholders'].split(';');
          stakeholders.forEach(stakeholder => {
            if (stakeholder.trim()) {
              peopleRoles.push({
                role: 'business_stakeholder',
                name: stakeholder.trim()
              });
            }
          });
        }
        
        // Add Modified By person
        if (automation['Modified By']?.trim()) {
          // Modified By will be handled by the backend when creating the person
          cleanedAutomation.modified_by_name = automation['Modified By'].trim();
        }
        
        cleanedAutomation.people_data = peopleRoles;
        
        // Parse environment data for all environment types
        const environments = [];
        
        if (automation['Dev VDI']?.trim() || automation['Dev Service Account']?.trim()) {
          environments.push({
            type: 'dev',
            vdi: automation['Dev VDI']?.trim() || '',
            service_account: automation['Dev Service Account']?.trim() || ''
          });
        }
        
        if (automation['QA VDI']?.trim() || automation['QA Service Account']?.trim()) {
          environments.push({
            type: 'qa',
            vdi: automation['QA VDI']?.trim() || '',
            service_account: automation['QA Service Account']?.trim() || ''
          });
        }
        
        if (automation['Production VDI']?.trim() || automation['Production Service Account']?.trim()) {
          environments.push({
            type: 'prod',
            vdi: automation['Production VDI']?.trim() || '',
            service_account: automation['Production Service Account']?.trim() || ''
          });
        }
        
        cleanedAutomation.environments_data = environments;
        
        // Parse test data
        if (automation['Test Data SPOC']?.trim()) {
          cleanedAutomation.test_data_data = {
            spoc: automation['Test Data SPOC'].trim()
          };
        }
        
        // Parse metrics data from comprehensive fields
        const totalCases = automation['Post Production Total Cases']?.trim();
        const exceptionsCount = automation['Post Production System Exceptions Count']?.trim();
        const successRate = automation['Post Production Success Rate']?.trim();
        
        if (totalCases || exceptionsCount || successRate) {
          cleanedAutomation.metrics_data = {
            post_prod_total_cases: totalCases ? parseInt(totalCases) : null,
            post_prod_sys_ex_count: exceptionsCount ? parseInt(exceptionsCount) : null,
            post_prod_success_rate: successRate ? parseFloat(successRate) : null
          };
        }
        
        // Parse artifacts data
        const artifactsLink = automation['Automation Artifacts Link']?.trim();
        const codeReview = automation['Code Review with M&E']?.trim();
        const demo = automation['Automation Demo to M&E']?.trim();
        const rampupIssue = automation['Rampup/Postprod Issue/Resolution list to M&E']?.trim();
        
        if (artifactsLink || codeReview || demo || rampupIssue) {
          cleanedAutomation.artifacts_data = {
            artifacts_link: artifactsLink || null,
            code_review: codeReview || null,
            demo: demo || null,
            rampup_issue_list: rampupIssue || null
          };
        }
        
        console.log('Cleaned automation:', cleanedAutomation);
        
        // Ensure required fields exist and are not empty
        if (cleanedAutomation.air_id && cleanedAutomation.name && cleanedAutomation.type) {
          automations.push(cleanedAutomation);
          console.log(`✅ Valid automation ${i}: ${cleanedAutomation.air_id} - ${cleanedAutomation.name}`);
        } else {
          console.warn(`⚠️ Skipping automation on line ${i}: missing required fields`, {
            air_id: cleanedAutomation.air_id || '(empty)',
            name: cleanedAutomation.name || '(empty)', 
            type: cleanedAutomation.type || '(empty)'
          });
          console.warn(`Raw data for line ${i}:`, {
            'AIR ID': automation['AIR ID'],
            'Name': automation['Name'],
            'Type': automation['Type']
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
      console.log('📊 CSV Parsing Results:');
      console.log(`  - Total lines in CSV: ${text.split('\n').length}`);
      console.log(`  - Non-empty lines: ${text.split('\n').filter(line => line.trim()).length}`);
      console.log(`  - Valid automations parsed: ${csvAutomations.length}`);
      console.log('First automation sample:', csvAutomations[0]);
      
      if (csvAutomations.length === 0) {
        alert('No valid automation data found in CSV. Please check that:\n' +
              '1. The CSV has the correct headers (AIR ID, Name, Type are required)\n' +
              '2. Each row has data in the AIR ID, Name, and Type columns\n' +
              '3. The file is properly formatted as CSV\n' +
              '\nCheck the browser console for detailed parsing information.');
        return;
      }

      // Import automations one by one
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (const automation of csvAutomations) {
        try {
          console.log('Importing automation:', automation.air_id);
          const response = await fetch('/api/automations/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(automation),
          });

          if (response.ok) {
            successCount++;
            console.log('✅ Successfully imported:', automation.air_id);
          } else {
            errorCount++;
            let errorText = await response.text();
            console.error('❌ Failed to import:', automation.air_id, 'Status:', response.status, 'Error:', errorText);
            
            // Try to parse the error as JSON for better formatting
            try {
              const errorData = JSON.parse(errorText);
              const errorDetails = [];
              for (const [field, messages] of Object.entries(errorData)) {
                errorDetails.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
              }
              errorText = errorDetails.join('; ');
            } catch (e) {
              // Use raw error text if JSON parsing fails
            }
            
            errors.push(`Row ${csvAutomations.indexOf(automation) + 1}: ${automation.air_id || 'Unknown'} - ${errorText}`);
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

  // Get unique values for people roles
  const getUniqueRoleValues = (role) => {
    const values = automations
      .map(automation => {
        if (automation.people && Array.isArray(automation.people)) {
          const person = automation.people.find(p => p.role === role);
          return person ? person.name : null;
        }
        return null;
      })
      .filter(value => value && value.trim())
      .map(value => value.trim());
    return [...new Set(values)].sort();
  };

  // Get unique values for environment fields
  const getUniqueEnvironmentValues = (envType, field) => {
    const values = automations
      .map(automation => {
        if (automation.environments && Array.isArray(automation.environments)) {
          const env = automation.environments.find(e => e.type === envType);
          return env ? env[field] : null;
        }
        return null;
      })
      .filter(value => value && value.trim())
      .map(value => value.trim());
    return [...new Set(values)].sort();
  };

  // Get unique values for modified_by
  const getUniqueModifiedByValues = () => {
    const values = automations
      .map(automation => automation.modified_by_name)
      .filter(value => value && value.trim())
      .map(value => value.trim());
    return [...new Set(values)].sort();
  };

  // Get unique values for test data SPOC
  const getUniqueTestDataValues = () => {
    const values = automations
      .map(automation => automation.test_data?.spoc)
      .filter(value => value && value.trim())
      .map(value => value.trim());
    return [...new Set(values)].sort();
  };

  const clearFilters = () => {
    setFilters({
      // Basic fields
      type: '',
      complexity: '',
      coe_fed: '',
      hasDescription: '',
      
      // Tool fields
      tool_name: '',
      tool_version: '',
      
      // Process fields
      queue: '',
      qa_handshake: '',
      
      // Modified by
      modified_by: '',
      
      // People roles
      project_manager: '',
      developer: '',
      tester: '',
      business_spoc: '',
      
      // Date filters
      preprod_deploy_date: { type: '', value: '' },
      prod_deploy_date: { type: '', value: '' },
      warranty_end_date: { type: '', value: '' },
      modified: { type: '', value: '' },
      created_at: { type: '', value: '' },
      updated_at: { type: '', value: '' },
      
      // Environment filters
      dev_vdi: '',
      qa_vdi: '',
      prod_vdi: '',
      dev_service_account: '',
      qa_service_account: '',
      prod_service_account: '',
      
      // Metrics filters
      post_prod_success_rate: { type: '', value: '' },
      post_prod_total_cases: { type: '', value: '' },
      
      // Artifacts filters
      code_review: '',
      demo: '',
      
      // Test data
      test_data_spoc: ''
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return value.type !== '' || value.value !== '';
    }
    return value !== '';
  });

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
      'UAT VDI': automation.environments?.find(e => e.type === 'UAT')?.vdi || '',
      'UAT Service Account': automation.environments?.find(e => e.type === 'UAT')?.service_account || '',
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
  const getDisplayAutomations = useCallback(() => {
    // Helper function for date filtering
    const matchesDateFilter = (dateValue, filter) => {
      if (!filter.type || !filter.value) return true;
      
      const date = dateValue ? new Date(dateValue) : null;
      const filterDate = new Date(filter.value);
      
      if (!date) return false;
      
      switch (filter.type) {
        case 'before':
          return date < filterDate;
        case 'after':
          return date > filterDate;
        case 'on':
          return date.toDateString() === filterDate.toDateString();
        default:
          return true;
      }
    };

    // Helper function for numeric filtering
    const matchesNumericFilter = (numericValue, filter) => {
      if (!filter.type || !filter.value) return true;
      
      const value = parseFloat(numericValue);
      const filterValue = parseFloat(filter.value);
      
      if (isNaN(value) || isNaN(filterValue)) return false;
      
      switch (filter.type) {
        case 'equals':
          return value === filterValue;
        case 'greater':
          return value > filterValue;
        case 'less':
          return value < filterValue;
        case 'greater_equal':
          return value >= filterValue;
        case 'less_equal':
          return value <= filterValue;
        default:
          return true;
      }
    };

    // Helper function to check if automation matches all filters
    const matchesAllFilters = (automation) => {
      // Basic text filters
      if (filters.type && automation.type?.toLowerCase() !== filters.type.toLowerCase()) return false;
      if (filters.complexity && automation.complexity?.toLowerCase() !== filters.complexity.toLowerCase()) return false;
      if (filters.coe_fed && automation.coe_fed?.toLowerCase() !== filters.coe_fed.toLowerCase()) return false;
      
      // Has description filter
      if (filters.hasDescription) {
        if (filters.hasDescription === 'with' && !automation.brief_description) return false;
        if (filters.hasDescription === 'without' && automation.brief_description) return false;
      }
      
      // Tool filters
      if (filters.tool_name && automation.tool_name?.toLowerCase() !== filters.tool_name.toLowerCase()) return false;
      if (filters.tool_version && automation.tool_version?.toLowerCase() !== filters.tool_version.toLowerCase()) return false;
      
      // Process fields
      if (filters.queue && automation.queue?.toLowerCase() !== filters.queue.toLowerCase()) return false;
      if (filters.qa_handshake && automation.qa_handshake?.toLowerCase() !== filters.qa_handshake.toLowerCase()) return false;
      
      // Modified by
      if (filters.modified_by && automation.modified_by_name?.toLowerCase() !== filters.modified_by.toLowerCase()) return false;
      
      // People role filters
      if (filters.project_manager || filters.developer || filters.tester || filters.business_spoc) {
        if (!automation.people || !Array.isArray(automation.people)) return false;
        
        if (filters.project_manager) {
          const pm = automation.people.find(p => p.role === 'Project Manager');
          if (!pm || pm.name?.toLowerCase() !== filters.project_manager.toLowerCase()) return false;
        }
        
        if (filters.developer) {
          const dev = automation.people.find(p => p.role === 'Developer');
          if (!dev || dev.name?.toLowerCase() !== filters.developer.toLowerCase()) return false;
        }
        
        if (filters.tester) {
          const tester = automation.people.find(p => p.role === 'Tester');
          if (!tester || tester.name?.toLowerCase() !== filters.tester.toLowerCase()) return false;
        }
        
        if (filters.business_spoc) {
          const spoc = automation.people.find(p => p.role === 'Business SPOC');
          if (!spoc || spoc.name?.toLowerCase() !== filters.business_spoc.toLowerCase()) return false;
        }
      }
      
      // Environment filters
      if (automation.environments && Array.isArray(automation.environments)) {
        if (filters.dev_vdi) {
          const devEnv = automation.environments.find(e => e.type === 'Development');
          if (!devEnv || devEnv.vdi?.toLowerCase() !== filters.dev_vdi.toLowerCase()) return false;
        }
        
        if (filters.qa_vdi) {
          const qaEnv = automation.environments.find(e => e.type === 'QA');
          if (!qaEnv || qaEnv.vdi?.toLowerCase() !== filters.qa_vdi.toLowerCase()) return false;
        }
        
        if (filters.prod_vdi) {
          const prodEnv = automation.environments.find(e => e.type === 'Production');
          if (!prodEnv || prodEnv.vdi?.toLowerCase() !== filters.prod_vdi.toLowerCase()) return false;
        }
        
        if (filters.dev_service_account) {
          const devEnv = automation.environments.find(e => e.type === 'Development');
          if (!devEnv || devEnv.service_account?.toLowerCase() !== filters.dev_service_account.toLowerCase()) return false;
        }
        
        if (filters.qa_service_account) {
          const qaEnv = automation.environments.find(e => e.type === 'QA');
          if (!qaEnv || qaEnv.service_account?.toLowerCase() !== filters.qa_service_account.toLowerCase()) return false;
        }
        
        if (filters.prod_service_account) {
          const prodEnv = automation.environments.find(e => e.type === 'Production');
          if (!prodEnv || prodEnv.service_account?.toLowerCase() !== filters.prod_service_account.toLowerCase()) return false;
        }
      }
      
      // Test data filters
      if (filters.test_data_spoc && automation.test_data?.spoc?.toLowerCase() !== filters.test_data_spoc.toLowerCase()) return false;
      
      // Artifacts filters
      if (filters.code_review && automation.artifacts?.code_review?.toLowerCase() !== filters.code_review.toLowerCase()) return false;
      if (filters.demo && automation.artifacts?.demo?.toLowerCase() !== filters.demo.toLowerCase()) return false;
      
      // Date filters
      if (!matchesDateFilter(automation.preprod_deploy_date, filters.preprod_deploy_date)) return false;
      if (!matchesDateFilter(automation.prod_deploy_date, filters.prod_deploy_date)) return false;
      if (!matchesDateFilter(automation.warranty_end_date, filters.warranty_end_date)) return false;
      if (!matchesDateFilter(automation.modified, filters.modified)) return false;
      if (!matchesDateFilter(automation.created_at, filters.created_at)) return false;
      if (!matchesDateFilter(automation.updated_at, filters.updated_at)) return false;
      
      // Numeric filters for metrics
      if (!matchesNumericFilter(automation.metrics?.post_prod_success_rate, filters.post_prod_success_rate)) return false;
      if (!matchesNumericFilter(automation.metrics?.post_prod_total_cases, filters.post_prod_total_cases)) return false;
      
      return true;
    };

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
      if (hasActiveFilters) {
        searchMatches = searchMatches.filter(automation => matchesAllFilters(automation));
      }
      
      // If no filters, also include other automations not in search results
      if (!hasActiveFilters) {
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

      // Apply all other filters
      const matchesFilters = matchesAllFilters(automation);

      return matchesSearch && matchesFilters;
    });
  }, [searchResults, searchTerm, filters, automations, hasActiveFilters]);

  const filteredAutomations = useMemo(() => {
    const automationsToSort = getDisplayAutomations();
    
    if (!sortConfig.key) {
      return automationsToSort;
    }

    return [...automationsToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [getDisplayAutomations, sortConfig]);  const handleRowClick = (automation) => {
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

  // Sorting functionality
  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col">
          <ChevronUpIcon className="h-3 w-3 text-gray-300" />
          <ChevronDownIcon className="h-3 w-3 text-gray-300 -mt-1" />
        </div>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-blue-600" />
    );
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Shared Header */}
      <SharedHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        filters={filters}
        onFiltersChange={setFilters}
        showFilters={showFilters}
        onToggleFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        getUniqueValues={getUniqueValues}
        viewType={viewType}
        onViewTypeChange={setViewType}
        onAddAutomation={() => setIsFormOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
        isImporting={isImporting}
        selectedItems={selectedItems}
        onExport={handleExport}
        showExportDropdown={showExportDropdown}
        onToggleExportDropdown={setShowExportDropdown}
        filterDropdownRef={filterDropdownRef}
        exportDropdownRef={exportDropdownRef}
        isSearching={isSearching}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onClearSearchResults={() => {
          setSearchResults(null);
          setShowSearchResults(false);
        }}
      />
      
      <div className="flex flex-1 overflow-hidden">
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
            getUniqueRoleValues={getUniqueRoleValues}
            getUniqueEnvironmentValues={getUniqueEnvironmentValues}
            getUniqueModifiedByValues={getUniqueModifiedByValues}
            getUniqueTestDataValues={getUniqueTestDataValues}
            allAutomations={automations}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            onExport={handleExport}
            showExportDropdown={showExportDropdown}
            onToggleExportDropdown={setShowExportDropdown}
            // Import props
            onImport={() => setIsImportModalOpen(true)}
            isImporting={isImporting}
            editingCell={editingCell}
            editingValue={editingValue}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={saveEdit}
            onEditValueChange={setEditingValue}
            onKeyPress={handleKeyPress}
            isEditing={isEditing}
            // Enhanced search props
            searchResults={searchResults}
            isSearching={isSearching}
            showSearchResults={showSearchResults}
            onClearSearch={clearSearch}
            renderEditableCell={renderEditableCell}
          />
        </div>
      ) : (
        // Slide View - header now shared above
        <div className="flex h-full w-full overflow-hidden">
          {/* Main Content Area */}
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-2/3' : 'w-full'}`}>
            {/* Table */}
            <div className="flex-1 overflow-auto">
              <div className={`${isSidebarOpen ? 'px-6 py-4' : 'p-0'}`}>
                {loading ? (
                  <div className={`bg-white shadow rounded-lg p-8 ${!isSidebarOpen ? 'm-6' : ''}`}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-4">Loading automations...</p>
                    </div>
                  </div>
                ) : (
                  <div className={`bg-white shadow ${isSidebarOpen ? 'rounded-lg' : ''} overflow-hidden ${!isSidebarOpen ? 'm-6 rounded-lg' : ''}`}>
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
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('air_id')}
                          >
                            <div className="flex items-center justify-between">
                              <span>AIR ID</span>
                              {getSortIcon('air_id')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Automation Name</span>
                              {getSortIcon('name')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('type')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Type</span>
                              {getSortIcon('type')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('complexity')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Complexity</span>
                              {getSortIcon('complexity')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('brief_description')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Description</span>
                              {getSortIcon('brief_description')}
                            </div>
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
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                  <AuditLog 
                    isOpen={isAuditLogOpen} 
                    onToggle={() => setIsAuditLogOpen(!isAuditLogOpen)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-1/3 flex-shrink-0' : 'w-0'} overflow-hidden`}>
            <AutomationDetailsSidebar
              isOpen={isSidebarOpen}
              onClose={closeSidebar}
              automation={selectedAutomation}
              onDeleteAutomation={handleDeleteAutomation}
              searchTerm={searchTerm}
            />
          </div>
        </div>
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
    </div>
  );
}
