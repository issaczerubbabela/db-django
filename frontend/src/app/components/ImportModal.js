'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, DocumentTextIcon, TableCellsIcon, ClipboardDocumentIcon, ArrowDownTrayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function ImportModal({ isOpen, onClose, onImport, existingAutomations = [] }) {
  const [step, setStep] = useState(1); // 1: Select File, 2: Preview, 3: Validation Results
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [importPreview, setImportPreview] = useState({ newRecords: [], updateRecords: [], errors: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showTemplate, setShowTemplate] = useState(false);
  const fileInputRef = useRef(null);

  // Template data structure based on the Automation model
  const templateHeaders = [
    'air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity',
    'tool_version', 'process_details', 'object_details', 'queue',
    'shared_folders', 'shared_mailboxes', 'qa_handshake',
    'preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date',
    'comments', 'documentation', 'modified', 'path'
  ];

  const sampleData = [
    {
      air_id: 'AIR-2024-001',
      name: 'Invoice Processing Automation',
      type: 'RPA',
      brief_description: 'Automated invoice processing and validation',
      coe_fed: 'Finance',
      complexity: 'Medium',
      tool_version: 'UiPath 2023.4',
      process_details: 'Processes invoices from shared mailbox',
      object_details: 'Invoice data extraction and validation',
      queue: 'InvoiceQueue',
      shared_folders: '\\\\server\\invoices',
      shared_mailboxes: 'invoices@company.com',
      qa_handshake: 'QA-001',
      preprod_deploy_date: '2024-01-15',
      prod_deploy_date: '2024-02-01',
      warranty_end_date: '2024-08-01',
      comments: 'Initial version deployed',
      documentation: 'https://docs.company.com/automation-001',
      modified: '2024-01-20',
      path: '\\\\automation\\invoices'
    }
  ];

  // Reset modal state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedFile(null);
      setFileType(null);
      setParsedData([]);
      setPreviewData([]);
      setImportPreview({ newRecords: [], updateRecords: [], errors: [] });
      setIsProcessing(false);
      setImportProgress({ current: 0, total: 0 });
      setShowTemplate(false);
    }
  }, [isOpen]);

  const downloadTemplate = (format) => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Automation Template');

    if (format === 'excel') {
      XLSX.writeFile(wb, 'automation_import_template.xlsx');
    } else if (format === 'csv') {
      const csv = Papa.unparse(sampleData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'automation_import_template.csv';
      link.click();
    } else if (format === 'json') {
      const jsonData = JSON.stringify(sampleData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'automation_import_template.json';
      link.click();
    }
  };

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
      setPreviewData(data.slice(0, 10)); // Show first 10 rows for preview
      analyzeImportData(data);
      setStep(2);
    } catch (error) {
      alert(`Error parsing file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeImportData = (data) => {
    const newRecords = [];
    const updateRecords = [];
    const errors = [];
    const existingAirIds = new Set(existingAutomations.map(a => a.air_id));

    data.forEach((row, index) => {
      const validation = validateRow(row, index + 1);
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        return;
      }

      const cleanedRow = validation.data;
      if (existingAirIds.has(cleanedRow.air_id)) {
        updateRecords.push({
          ...cleanedRow,
          existingData: existingAutomations.find(a => a.air_id === cleanedRow.air_id)
        });
      } else {
        newRecords.push(cleanedRow);
      }
    });

    setImportPreview({ newRecords, updateRecords, errors });
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
    ['preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date', 'modified'].forEach(dateField => {
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

  const handleImport = async () => {
    setIsProcessing(true);
    setStep(3);
    
    const allRecords = [...importPreview.newRecords, ...importPreview.updateRecords];
    let successCount = 0;
    let errorCount = 0;
    const importErrors = [];

    setImportProgress({ current: 0, total: allRecords.length });

    for (let i = 0; i < allRecords.length; i++) {
      const record = allRecords[i];
      setImportProgress({ current: i + 1, total: allRecords.length });

      try {
        const isUpdate = importPreview.updateRecords.includes(record);
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate ? `/api/automations/${record.air_id}` : '/api/automations';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
          const errorText = await response.text();
          importErrors.push(`${record.air_id}: ${errorText}`);
        }
      } catch (error) {
        errorCount++;
        importErrors.push(`${record.air_id}: ${error.message}`);
      }
    }

    // Call the parent's onImport callback to refresh data
    if (onImport) {
      await onImport();
    }

    // Show final results
    const message = `Import completed!\nSuccessful: ${successCount}\nErrors: ${errorCount}`;
    if (importErrors.length > 0) {
      console.error('Import errors:', importErrors);
    }
    
    setIsProcessing(false);
    
    // Auto-close after a delay if successful
    if (errorCount === 0) {
      setTimeout(() => onClose(), 2000);
    }
  };

  const getChangedFields = (newData, existingData) => {
    const changes = {};
    templateHeaders.forEach(field => {
      if (newData[field] !== existingData[field]) {
        changes[field] = { old: existingData[field], new: newData[field] };
      }
    });
    return changes;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Automations - Step {step} of 3
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
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Download Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                  Download Import Template
                </h3>
                <p className="text-blue-700 mb-4">
                  Download a template file with the correct column headers and sample data to ensure your import succeeds.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadTemplate('excel')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <TableCellsIcon className="h-4 w-4 mr-2" />
                    Excel Template
                  </button>
                  <button
                    onClick={() => downloadTemplate('csv')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    CSV Template
                  </button>
                  <button
                    onClick={() => downloadTemplate('json')}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    JSON Template
                  </button>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select Import File
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a CSV, Excel (.xlsx/.xls), or JSON file to import automation data
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

              {/* Supported Fields */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Supported Fields</h4>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                  {templateHeaders.map(header => (
                    <div key={header} className="px-2 py-1 bg-white rounded">
                      {header} {['air_id', 'name', 'type'].includes(header) && <span className="text-red-500">*</span>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">* Required fields</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">File Information</h3>
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

              {/* Import Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">New Records</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {importPreview.newRecords.length}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Updates</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {importPreview.updateRecords.length}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">Errors</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {importPreview.errors.length}
                  </div>
                </div>
              </div>

              {/* Preview Data */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Preview (First 10 rows)</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">AIR ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Complexity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => {
                        const isNew = importPreview.newRecords.some(r => r.air_id === row.air_id);
                        const isUpdate = importPreview.updateRecords.some(r => r.air_id === row.air_id);
                        const hasError = importPreview.errors.some(e => e.includes(`Row ${index + 1}`));
                        
                        return (
                          <tr key={index} className={hasError ? 'bg-red-50' : ''}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              {hasError ? (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Error</span>
                              ) : isNew ? (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">New</span>
                              ) : isUpdate ? (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Update</span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Unknown</span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.air_id}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">
                              {row.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {row.type}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {row.complexity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Error Details */}
              {importPreview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                  <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    {importPreview.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Details */}
              {importPreview.updateRecords.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Records to be Updated</h4>
                  <div className="text-sm text-blue-700 max-h-32 overflow-y-auto">
                    {importPreview.updateRecords.slice(0, 5).map((record, index) => {
                      const changes = getChangedFields(record, record.existingData);
                      const changeCount = Object.keys(changes).length;
                      return (
                        <div key={index} className="mb-2">
                          <span className="font-medium">{record.air_id}</span> - {changeCount} field(s) will be updated
                        </div>
                      );
                    })}
                    {importPreview.updateRecords.length > 5 && (
                      <div className="text-blue-600">... and {importPreview.updateRecords.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isProcessing ? 'Importing Records...' : 'Import Complete'}
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
                      Processing {importProgress.current} of {importProgress.total} records...
                    </p>
                  </div>
                )}

                {!isProcessing && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700">Import process completed successfully!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-3">
            {step > 1 && step < 3 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {step === 3 && !isProcessing ? 'Close' : 'Cancel'}
            </button>
            {step === 2 && importPreview.errors.length === 0 && (
              <button
                onClick={handleImport}
                disabled={isProcessing || (importPreview.newRecords.length + importPreview.updateRecords.length) === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Import {importPreview.newRecords.length + importPreview.updateRecords.length} Records
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
