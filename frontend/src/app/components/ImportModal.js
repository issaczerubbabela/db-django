'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ImportModal({ isOpen, onClose, onImport, existingAutomations = [], defaultFormat = 'csv' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileFormat, setFileFormat] = useState(defaultFormat);
  const [previewData, setPreviewData] = useState([]);
  const [previewAnalysis, setPreviewAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select file, 2: Preview, 3: Import
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Update file format when defaultFormat changes
  useEffect(() => {
    setFileFormat(defaultFormat);
  }, [defaultFormat]);

  const templateFields = [
    // Main automation fields
    'air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity',
    'tool_name', 'tool_version', 'process_details', 'object_details', 'queue',
    'shared_folders', 'shared_mailboxes', 'qa_handshake',
    'preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date',
    'comments', 'documentation', 'modified', 'modified_by_name', 'path',
    // People roles
    'project_manager', 'project_designer', 'developer', 'tester', 
    'business_spoc', 'business_stakeholder', 'app_owner',
    // Environments
    'dev_vdi', 'dev_service_account', 'qa_vdi', 'qa_service_account',
    'uat_vdi', 'uat_service_account', 'prod_vdi', 'prod_service_account',
    // Test Data
    'test_data_spoc',
    // Metrics
    'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate',
    // Artifacts
    'artifacts_link', 'code_review', 'demo', 'rampup_issue_list'
  ];

  const sampleData = {
    // Main automation fields
    air_id: 'AIR-2024-001',
    name: 'Sample Automation Process',
    type: 'RPA',
    brief_description: 'Automated invoice processing system',
    coe_fed: 'Finance',
    complexity: 'Medium',
    tool_name: 'UiPath',
    tool_version: 'UiPath 2023.10',
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
    project_manager: 'Alice Johnson',
    project_designer: 'Bob Smith',
    developer: 'Charlie Brown',
    tester: 'Diana Prince',
    business_spoc: 'Eve Adams',
    business_stakeholder: 'Frank Miller',
    app_owner: 'Grace Lee',
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
    test_data_spoc: 'Test Data Manager',
    // Metrics
    post_prod_total_cases: '1000',
    post_prod_sys_ex_count: '5',
    post_prod_success_rate: '99.5',
    // Artifacts
    artifacts_link: 'https://sharepoint.company.com/automation/artifacts',
    code_review: 'completed',
    demo: 'completed',
    rampup_issue_list: 'Minor configuration issues resolved'
  };

  // Clean and validate automation data
  const cleanAutomationData = (automation) => {
    const cleaned = {
      // Main automation fields
      air_id: automation.air_id?.trim() || '',
      name: automation.name?.trim() || '',
      type: automation.type?.trim() || '',
      brief_description: automation.brief_description?.trim() || null,
      coe_fed: automation.coe_fed?.trim() || null,
      complexity: automation.complexity?.trim() || null,
      tool_name: automation.tool_name?.trim() || null,
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
      modified_by_name: automation.modified_by_name?.trim() || null,
      path: automation.path?.trim() || null,
      
      // People roles - flattened for import
      project_manager: automation.project_manager?.trim() || null,
      project_designer: automation.project_designer?.trim() || null,
      developer: automation.developer?.trim() || null,
      tester: automation.tester?.trim() || null,
      business_spoc: automation.business_spoc?.trim() || null,
      business_stakeholder: automation.business_stakeholder?.trim() || null,
      app_owner: automation.app_owner?.trim() || null,
      
      // Environments - flattened for import
      dev_vdi: automation.dev_vdi?.trim() || null,
      dev_service_account: automation.dev_service_account?.trim() || null,
      qa_vdi: automation.qa_vdi?.trim() || null,
      qa_service_account: automation.qa_service_account?.trim() || null,
      uat_vdi: automation.uat_vdi?.trim() || null,
      uat_service_account: automation.uat_service_account?.trim() || null,
      prod_vdi: automation.prod_vdi?.trim() || null,
      prod_service_account: automation.prod_service_account?.trim() || null,
      
      // Test Data
      test_data_spoc: automation.test_data_spoc?.trim() || null,
      
      // Metrics
      post_prod_total_cases: automation.post_prod_total_cases ? parseInt(automation.post_prod_total_cases) || null : null,
      post_prod_sys_ex_count: automation.post_prod_sys_ex_count ? parseInt(automation.post_prod_sys_ex_count) || null : null,
      post_prod_success_rate: automation.post_prod_success_rate ? parseFloat(automation.post_prod_success_rate) || null : null,
      
      // Artifacts
      artifacts_link: automation.artifacts_link?.trim() || null,
      code_review: automation.code_review?.trim() || null,
      demo: automation.demo?.trim() || null,
      rampup_issue_list: automation.rampup_issue_list?.trim() || null,
      
      // Keep original structure for compatibility
      people: automation.people || [],
      environments: automation.environments || [],
      test_data: automation.test_data || {},
      metrics: automation.metrics || {},
      artifacts: automation.artifacts || {}
    };

    // Return only if required fields are present
    if (cleaned.air_id && cleaned.name && cleaned.type) {
      return cleaned;
    }
    return null;
  };

  // Template download functions
  const downloadCSVTemplate = () => {
    const csvContent = [
      templateFields.join(','),
      templateFields.map(field => sampleData[field] || '').join(',')
    ].join('\n');

    downloadFile(csvContent, 'automation_template.csv', 'text/csv;charset=utf-8;');
  };

  const downloadJSONTemplate = () => {
    const jsonTemplate = [sampleData];
    const jsonContent = JSON.stringify(jsonTemplate, null, 2);
    downloadFile(jsonContent, 'automation_template.json', 'application/json;charset=utf-8;');
  };

  const downloadExcelTemplate = () => {
    // Create Excel-compatible tab-separated format
    const excelContent = [
      templateFields.join('\t'),
      templateFields.map(field => sampleData[field] || '').join('\t')
    ].join('\n');

    downloadFile(excelContent, 'automation_template.xls', 'application/vnd.ms-excel;charset=utf-8;');
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

  // File parsing functions
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

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
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        // Clean and validate the data
        const cleanedRow = cleanAutomationData(row);
        if (cleanedRow) {
          data.push(cleanedRow);
        }
      }
    }
    return data;
  };

  const parseJSON = (text) => {
    try {
      const rawData = JSON.parse(text);
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];
      
      return dataArray.map(item => cleanAutomationData(item)).filter(Boolean);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  const parseExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const lines = data.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            resolve([]);
            return;
          }

          const headers = lines[0].split('\t').map(h => h.trim());
          const result = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t');
            if (values.length === headers.length) {
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index]?.trim() || '';
              });
              
              const cleanedRow = cleanAutomationData(row);
              if (cleanedRow) {
                result.push(cleanedRow);
              }
            }
          }
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Analyze preview data
  const analyzeData = (data) => {
    const existing = [];
    const newRecords = [];
    const errors = [];

    data.forEach((record, index) => {
      const validation = validateRecord(record, index + 1);
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
      }

      if (record.air_id) {
        const existingRecord = existingAutomations.find(auto => auto.air_id === record.air_id);
        if (existingRecord) {
          existing.push({
            ...record,
            _index: index,
            _existingData: existingRecord,
            _changes: getChanges(existingRecord, record)
          });
        } else {
          newRecords.push({ ...record, _index: index });
        }
      } else {
        newRecords.push({ ...record, _index: index });
      }
    });

    return { existing, newRecords, errors };
  };

  const validateRecord = (record, lineNumber) => {
    const errors = [];
    
    if (!record.air_id?.trim()) {
      errors.push(`Line ${lineNumber}: Missing AIR ID`);
    }
    if (!record.name?.trim()) {
      errors.push(`Line ${lineNumber}: Missing name`);
    }
    if (!record.type?.trim()) {
      errors.push(`Line ${lineNumber}: Missing type`);
    }

    return { errors };
  };

  const getChanges = (existing, incoming) => {
    const changes = {};
    Object.keys(incoming).forEach(key => {
      if (key.startsWith('_')) return; // Skip internal fields
      if (existing[key] !== incoming[key]) {
        changes[key] = {
          old: existing[key],
          new: incoming[key]
        };
      }
    });
    return changes;
  };

  // File handling
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setErrors([]);

    try {
      let data = [];

      // Detect file format if not explicitly set
      const extension = file.name.split('.').pop().toLowerCase();
      let format = fileFormat;
      
      if (extension === 'json' && fileFormat === 'csv') {
        format = 'json';
        setFileFormat('json');
      } else if ((extension === 'xls' || extension === 'xlsx') && fileFormat === 'csv') {
        format = 'excel';
        setFileFormat('excel');
      }

      // Parse based on format
      switch (format) {
        case 'csv':
          const csvText = await file.text();
          data = parseCSV(csvText);
          break;
        case 'json':
          const jsonText = await file.text();
          data = parseJSON(jsonText);
          break;
        case 'excel':
          data = await parseExcel(file);
          break;
        default:
          throw new Error('Unsupported file format');
      }

      if (data.length === 0) {
        throw new Error('No valid data found in file');
      }

      setPreviewData(data);
      const analysis = analyzeData(data);
      setPreviewAnalysis(analysis);
      setErrors(analysis.errors);
      setStep(2);

    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!previewAnalysis) return;

    setIsImporting(true);
    try {
      const allRecords = [...previewAnalysis.existing, ...previewAnalysis.newRecords];
      await onImport(allRecords, previewAnalysis);
      onClose();
      resetModal();
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setPreviewAnalysis(null);
    setStep(1);
    setErrors([]);
    setIsProcessing(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Import Automations
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex items-center">
                <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Select File</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Preview & Validate</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Import</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Template Downloads */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Download Templates</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadCSVTemplate}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      CSV Template
                    </button>
                    <button
                      onClick={downloadJSONTemplate}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      JSON Template
                    </button>
                    <button
                      onClick={downloadExcelTemplate}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Excel Template
                    </button>
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Select Import Format</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['csv', 'json', 'excel'].map((format) => (
                      <label key={format} className="relative">
                        <input
                          type="radio"
                          name="format"
                          value={format}
                          checked={fileFormat === format}
                          onChange={(e) => setFileFormat(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                          fileFormat === format 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900 uppercase">{format}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {format === 'csv' && '.csv files'}
                              {format === 'json' && '.json files'}
                              {format === 'excel' && '.xls, .xlsx files'}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Upload File</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            accept={
                              fileFormat === 'csv' ? '.csv' :
                              fileFormat === 'json' ? '.json' :
                              '.xls,.xlsx'
                            }
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          {fileFormat === 'csv' && 'CSV files up to 10MB'}
                          {fileFormat === 'json' && 'JSON files up to 10MB'}
                          {fileFormat === 'excel' && 'Excel files up to 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Processing file...
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && previewAnalysis && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Import Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{previewAnalysis.newRecords.length}</div>
                      <div className="text-gray-500">New Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{previewAnalysis.existing.length}</div>
                      <div className="text-gray-500">Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{errors.length}</div>
                      <div className="text-gray-500">Errors</div>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc list-inside space-y-1">
                            {errors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {errors.length > 5 && (
                              <li>... and {errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Tables */}
                <div className="space-y-4">
                  {/* New Records */}
                  {previewAnalysis.newRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        New Records ({previewAnalysis.newRecords.length})
                      </h4>
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-60">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">AIR ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {previewAnalysis.newRecords.slice(0, 10).map((record, index) => (
                                <tr key={index} className="bg-green-50">
                                  <td className="px-3 py-2 text-sm text-gray-900">{record.air_id}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{record.name}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{record.type}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{record.brief_description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {previewAnalysis.newRecords.length > 10 && (
                          <div className="bg-gray-50 px-3 py-2 text-sm text-gray-500">
                            ... and {previewAnalysis.newRecords.length - 10} more new records
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Updates */}
                  {previewAnalysis.existing.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Records to Update ({previewAnalysis.existing.length})
                      </h4>
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-60">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">AIR ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {previewAnalysis.existing.slice(0, 10).map((record, index) => (
                                <tr key={index} className="bg-yellow-50">
                                  <td className="px-3 py-2 text-sm text-gray-900">{record.air_id}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{record.name}</td>
                                  <td className="px-3 py-2 text-sm text-gray-600">
                                    {Object.keys(record._changes || {}).length} field(s)
                                    <div className="text-xs text-gray-500">
                                      {Object.keys(record._changes || {}).slice(0, 3).join(', ')}
                                      {Object.keys(record._changes || {}).length > 3 && '...'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {previewAnalysis.existing.length > 10 && (
                          <div className="bg-gray-50 px-3 py-2 text-sm text-gray-500">
                            ... and {previewAnalysis.existing.length - 10} more updates
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 1 && (
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex space-x-3">
                <button
                  onClick={handleImport}
                  disabled={errors.length > 0 || isImporting}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? 'Importing...' : `Import ${previewAnalysis.newRecords.length + previewAnalysis.existing.length} Records`}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
