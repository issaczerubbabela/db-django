'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function ImportModal({ isOpen, onClose, onImport, existingAutomations = [] }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [syncPreview, setSyncPreview] = useState({ newRecords: [], updateRecords: [], deleteRecords: [], errors: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [syncResults, setSyncResults] = useState({ added: 0, updated: 0, deleted: 0, errors: [] });
  const fileInputRef = useRef(null);

  // Template data structure based on the comprehensive Automation model
  const templateHeaders = [
    // Core Automation fields
    'air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity',
    'tool_name', 'tool_version', 'process_details', 'object_details', 'queue',
    'shared_folders', 'shared_mailboxes', 'qa_handshake',
    'preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date',
    'comments', 'documentation', 'modified', 'modified_by', 'path',
    'created_at', 'updated_at',
    
    // Person roles (based on AutomationPersonRole model)
    'project_manager', 'project_designer', 'developer', 'tester', 
    'business_spoc', 'business_stakeholders', 'app_owner',
    
    // Environment configurations (based on Environment model)
    'dev_vdi', 'dev_service_account',
    'qa_vdi', 'qa_service_account', 
    'uat_vdi', 'uat_service_account',
    'prod_vdi', 'prod_service_account',
    
    // Test data (based on TestData model)
    'test_data_spoc',
    
    // Metrics data (based on Metrics model)
    'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate',
    
    // Artifacts (based on Artifacts model)
    'artifacts_link', 'code_review', 'demo', 'rampup_issue_list'
  ];

  // Reset modal state when opening/closing and auto-open file selector
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setFileType(null);
      setParsedData([]);
      setSyncPreview({ newRecords: [], updateRecords: [], deleteRecords: [], errors: [] });
      setIsProcessing(false);
      setImportProgress({ current: 0, total: 0 });
      setShowResults(false);
      setSyncResults({ added: 0, updated: 0, deleted: 0, errors: [] });
      
      // Auto-open file selector
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  }, [isOpen]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const extension = file.name.split('.').pop().toLowerCase();
      let data = [];

      if (extension === 'csv') {
        setFileType('CSV');
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transform: (value) => value.trim()
        });
        data = result.data;
      } else if (['xlsx', 'xls'].includes(extension)) {
        setFileType('Excel');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (extension === 'json') {
        setFileType('JSON');
        const text = await file.text();
        data = JSON.parse(text);
      } else {
        throw new Error('Unsupported file format. Please use CSV, Excel, or JSON files.');
      }

      setParsedData(data);
      analyzeSyncData(data);
    } catch (error) {
      alert(`Error parsing file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeSyncData = (data) => {
    const newRecords = [];
    const updateRecords = [];
    const deleteRecords = [];
    const errors = [];
    const existingAirIds = new Set(existingAutomations.map(a => a.air_id));
    const fileAirIds = new Set();

    // Process file data
    data.forEach((row, index) => {
      const validation = validateRow(row, index + 1);
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        return;
      }

      const cleanedRow = validation.data;
      fileAirIds.add(cleanedRow.air_id);

      if (existingAirIds.has(cleanedRow.air_id)) {
        const existingRecord = existingAutomations.find(a => a.air_id === cleanedRow.air_id);
        const hasChanges = hasRecordChanges(cleanedRow, existingRecord);
        
        if (hasChanges) {
          updateRecords.push({
            ...cleanedRow,
            existingData: existingRecord
          });
        }
      } else {
        newRecords.push(cleanedRow);
      }
    });

    // Find records to delete (exist in DB but not in file)
    existingAutomations.forEach(existing => {
      if (!fileAirIds.has(existing.air_id)) {
        deleteRecords.push(existing);
      }
    });

    setSyncPreview({ newRecords, updateRecords, deleteRecords, errors });
  };

  const hasRecordChanges = (newData, existingData) => {
    return templateHeaders.some(field => {
      const newValue = newData[field] || null;
      const existingValue = existingData[field] || null;
      return newValue !== existingValue;
    });
  };

  const transformDataForAPI = (csvData) => {
    const transformedData = { ...csvData };
    
    // Transform person fields to the format expected by the backend
    if (transformedData.modified_by) {
      transformedData.modified_by_name = transformedData.modified_by;
      delete transformedData.modified_by;
    }
    
    // Transform tool name field
    if (transformedData.tool_name) {
      transformedData.tool_name = transformedData.tool_name;
    }
    
    // Create people_data array for person roles
    const peopleData = [];
    
    // Map role fields to people_data
    const roleMapping = {
      project_manager: 'project_manager',
      project_designer: 'project_designer',
      developer: 'developer',
      tester: 'tester',
      business_spoc: 'business_spoc',
      business_stakeholders: 'business_stakeholder',
      app_owner: 'app_owner'
    };
    
    Object.entries(roleMapping).forEach(([csvField, dbRole]) => {
      if (transformedData[csvField]) {
        // Handle multiple people in business_stakeholders (semicolon separated)
        if (csvField === 'business_stakeholders') {
          const stakeholders = transformedData[csvField].split(';').map(s => s.trim());
          stakeholders.forEach(stakeholder => {
            if (stakeholder) {
              peopleData.push({ name: stakeholder, role: dbRole });
            }
          });
        } else {
          peopleData.push({ name: transformedData[csvField], role: dbRole });
        }
        delete transformedData[csvField];
      }
    });
    
    if (peopleData.length > 0) {
      transformedData.people_data = peopleData;
    }
    
    // Create environments_data array
    const environmentsData = [];
    const envTypes = ['dev', 'qa', 'uat', 'prod'];
    
    envTypes.forEach(envType => {
      const vdiField = `${envType}_vdi`;
      const serviceAccountField = `${envType}_service_account`;
      
      if (transformedData[vdiField] || transformedData[serviceAccountField]) {
        environmentsData.push({
          type: envType,
          vdi: transformedData[vdiField] || '',
          service_account: transformedData[serviceAccountField] || ''
        });
        delete transformedData[vdiField];
        delete transformedData[serviceAccountField];
      }
    });
    
    if (environmentsData.length > 0) {
      transformedData.environments_data = environmentsData;
    }
    
    // Create test_data_data
    if (transformedData.test_data_spoc) {
      transformedData.test_data_data = { spoc: transformedData.test_data_spoc };
      delete transformedData.test_data_spoc;
    }
    
    // Create metrics_data
    const metricsFields = ['post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate'];
    const metricsData = {};
    let hasMetrics = false;
    
    metricsFields.forEach(field => {
      if (transformedData[field] !== null && transformedData[field] !== undefined && transformedData[field] !== '') {
        metricsData[field] = transformedData[field];
        hasMetrics = true;
        delete transformedData[field];
      }
    });
    
    if (hasMetrics) {
      transformedData.metrics_data = metricsData;
    }
    
    // Create artifacts_data
    const artifactsFields = ['artifacts_link', 'code_review', 'demo', 'rampup_issue_list'];
    const artifactsData = {};
    let hasArtifacts = false;
    
    artifactsFields.forEach(field => {
      if (transformedData[field] !== null && transformedData[field] !== undefined && transformedData[field] !== '') {
        artifactsData[field] = transformedData[field];
        hasArtifacts = true;
        delete transformedData[field];
      }
    });
    
    if (hasArtifacts) {
      transformedData.artifacts_data = artifactsData;
    }
    
    return transformedData;
  };

  const validateRow = (row, rowNumber) => {
    const errors = [];
    const data = {};

    // Required fields validation
    if (!row.air_id || !row.air_id.trim()) {
      errors.push(`Row ${rowNumber}: AIR ID is required`);
    } else {
      data.air_id = row.air_id.trim();
    }

    if (!row.name || !row.name.trim()) {
      errors.push(`Row ${rowNumber}: Name is required`);
    } else {
      data.name = row.name.trim();
    }

    if (!row.type || !row.type.trim()) {
      errors.push(`Row ${rowNumber}: Type is required`);
    } else {
      data.type = row.type.trim();
    }

    // Map all template headers with proper null handling
    templateHeaders.forEach(field => {
      if (!['air_id', 'name', 'type'].includes(field)) {
        data[field] = row[field] ? row[field].toString().trim() : null;
        if (data[field] === '') data[field] = null;
      }
    });

    // Date validation and formatting
    ['preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date', 'modified', 'created_at', 'updated_at'].forEach(dateField => {
      if (data[dateField]) {
        try {
          const date = new Date(data[dateField]);
          if (isNaN(date.getTime())) {
            errors.push(`Row ${rowNumber}: Invalid date format for ${dateField}`);
            data[dateField] = null;
          } else {
            data[dateField] = date.toISOString();
          }
        } catch (e) {
          errors.push(`Row ${rowNumber}: Invalid date format for ${dateField}`);
          data[dateField] = null;
        }
      }
    });

    return { data, errors };
  };

  const handleSync = async () => {
    setIsProcessing(true);
    setShowResults(true);
    
    const totalOperations = syncPreview.newRecords.length + syncPreview.updateRecords.length + syncPreview.deleteRecords.length;
    let currentOperation = 0;
    let addedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    const syncErrors = [];

    setImportProgress({ current: 0, total: totalOperations });

    // Add new records
    for (const record of syncPreview.newRecords) {
      currentOperation++;
      setImportProgress({ current: currentOperation, total: totalOperations });

      try {
        const transformedRecord = transformDataForAPI(record);
        const response = await fetch('/api/automations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transformedRecord),
        });

        if (response.ok) {
          addedCount++;
        } else {
          const errorData = await response.json();
          const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData;
          syncErrors.push(`Add ${record.air_id}: ${errorMessage}`);
        }
      } catch (error) {
        syncErrors.push(`Add ${record.air_id}: ${error.message}`);
      }
    }

    // Update existing records
    for (const record of syncPreview.updateRecords) {
      currentOperation++;
      setImportProgress({ current: currentOperation, total: totalOperations });

      try {
        const transformedRecord = transformDataForAPI(record);
        const response = await fetch(`/api/automations/${record.air_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transformedRecord),
        });

        if (response.ok) {
          updatedCount++;
        } else {
          const errorData = await response.json();
          const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData;
          syncErrors.push(`Update ${record.air_id}: ${errorMessage}`);
        }
      } catch (error) {
        syncErrors.push(`Update ${record.air_id}: ${error.message}`);
      }
    }

    // Delete records not in file
    for (const record of syncPreview.deleteRecords) {
      currentOperation++;
      setImportProgress({ current: currentOperation, total: totalOperations });

      try {
        const response = await fetch(`/api/automations/${record.air_id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          deletedCount++;
        } else {
          const errorText = await response.text();
          syncErrors.push(`Delete ${record.air_id}: ${errorText}`);
        }
      } catch (error) {
        syncErrors.push(`Delete ${record.air_id}: ${error.message}`);
      }
    }

    setSyncResults({ added: addedCount, updated: updatedCount, deleted: deletedCount, errors: syncErrors });

    // Call the parent's onImport callback to refresh data
    if (onImport) {
      await onImport();
    }
    
    setIsProcessing(false);
    
    // Auto-close after a delay if no errors
    if (syncErrors.length === 0) {
      setTimeout(() => onClose(), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {showResults ? 'Sync Results' : 'Sync Automations'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {!selectedFile && !showResults && (
            <div className="text-center py-8">
              <DocumentArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select File to Sync
              </h3>
              <p className="text-gray-600 mb-4">
                Choose a CSV, Excel, or JSON file to sync automation data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Choose File'}
              </button>
            </div>
          )}

          {selectedFile && !showResults && syncPreview.errors.length === 0 && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Sync Preview</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">File: </span>
                    <span className="font-medium">{selectedFile?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type: </span>
                    <span className="font-medium">{fileType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Records: </span>
                    <span className="font-medium">{parsedData.length}</span>
                  </div>
                </div>
              </div>

              {/* Sync Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Add</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {syncPreview.newRecords.length}
                  </div>
                  <p className="text-xs text-green-700 mt-1">New records</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Update</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {syncPreview.updateRecords.length}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Changed records</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">Delete</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {syncPreview.deleteRecords.length}
                  </div>
                  <p className="text-xs text-red-700 mt-1">Records not in file</p>
                </div>
              </div>

              {/* Records to Delete */}
              {syncPreview.deleteRecords.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Records to be Deleted</h4>
                  <div className="text-sm text-red-700 max-h-32 overflow-y-auto">
                    {syncPreview.deleteRecords.slice(0, 10).map((record, index) => (
                      <div key={index} className="mb-1">
                        <span className="font-medium">{record.air_id}</span> - {record.name}
                      </div>
                    ))}
                    {syncPreview.deleteRecords.length > 10 && (
                      <div className="text-red-600">... and {syncPreview.deleteRecords.length - 10} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {syncPreview.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
              <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {syncPreview.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}

          {showResults && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isProcessing ? 'Syncing Records...' : 'Sync Complete'}
                </h3>
                
                {isProcessing && (
                  <div className="mb-4">
                    <div className="bg-gray-200 rounded-full h-4 w-full">
                      <div
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                        style={{
                          width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Processing {importProgress.current} of {importProgress.total} operations...
                    </p>
                  </div>
                )}

                {!isProcessing && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700">Sync completed successfully!</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white border rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{syncResults.added}</div>
                        <div className="text-sm text-gray-600">Added</div>
                      </div>
                      <div className="bg-white border rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{syncResults.updated}</div>
                        <div className="text-sm text-gray-600">Updated</div>
                      </div>
                      <div className="bg-white border rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-600">{syncResults.deleted}</div>
                        <div className="text-sm text-gray-600">Deleted</div>
                      </div>
                    </div>

                    {syncResults.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Errors</h4>
                        <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                          {syncResults.errors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div></div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {showResults && !isProcessing ? 'Close' : 'Cancel'}
            </button>
            {selectedFile && !showResults && syncPreview.errors.length === 0 && (
              <button
                onClick={handleSync}
                disabled={isProcessing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Sync {syncPreview.newRecords.length + syncPreview.updateRecords.length + syncPreview.deleteRecords.length} Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
