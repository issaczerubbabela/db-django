'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AutomationFormComplete({ isOpen, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      people: [{ name: '', role: '' }],
      environments: [{ type: '', vdi: '', service_account: '' }],
      test_data: { spoc: '' },
      metrics: { post_prod_total_cases: '', post_prod_sys_ex_count: '', post_prod_success_rate: '' },
      artifacts: { artifacts_link: '', code_review: '', demo: '', rampup_issue_list: '' }
    }
  });

  const { fields: peopleFields, append: appendPerson, remove: removePerson } = useFieldArray({
    control,
    name: 'people'
  });

  const { fields: envFields, append: appendEnv, remove: removeEnv } = useFieldArray({
    control,
    name: 'environments'
  });

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Add current timestamp for modified field
      data.modified = new Date().toISOString();
      data.modified_by = 'Current User'; // You can replace this with actual user data
      
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: '📄' },
    { id: 'technical', name: 'Technical', icon: '⚙️' },
    { id: 'people', name: 'People & Roles', icon: '👥' },
    { id: 'environments', name: 'Environments', icon: '🖥️' },
    { id: 'dates', name: 'Timeline', icon: '📅' },
    { id: 'metrics', name: 'Metrics', icon: '📊' },
    { id: 'artifacts', name: 'Artifacts', icon: '🔗' },
    { id: 'additional', name: 'Additional', icon: '📝' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add New Automation</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Form */}
          <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
              
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AIR ID *
                      </label>
                      <input
                        {...register('air_id', { required: 'AIR ID is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="e.g., AIR-001"
                      />
                      {errors.air_id && <p className="text-red-500 text-sm mt-1">{errors.air_id.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation Name *
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="e.g., Invoice Processing Automation"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation Type *
                      </label>
                      <select
                        {...register('type', { required: 'Type is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Select Type</option>
                        <option value="Process">Process</option>
                        <option value="API">API</option>
                        <option value="Report">Report</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Web">Web</option>
                        <option value="Database">Database</option>
                        <option value="ETL">ETL</option>
                        <option value="Document Processing">Document Processing</option>
                        <option value="HR Process">HR Process</option>
                        <option value="Communication">Communication</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation Complexity
                      </label>
                      <select
                        {...register('complexity')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Select Complexity</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        COE/FED
                      </label>
                      <select
                        {...register('coe_fed')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Select COE/FED</option>
                        <option value="COE">COE</option>
                        <option value="FED">FED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brief Description
                    </label>
                    <textarea
                      {...register('brief_description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="Brief description of the automation"
                    />
                  </div>
                </div>
              )}

              {/* Technical Tab */}
              {activeTab === 'technical' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tool
                      </label>
                      <select
                        {...register('tool')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Select Tool</option>
                        <option value="UiPath">UiPath</option>
                        <option value="Power Automate">Power Automate</option>
                        <option value="Automation Anywhere">Automation Anywhere</option>
                        <option value="Blue Prism">Blue Prism</option>
                        <option value="Python">Python</option>
                        <option value="VBA">VBA</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tool Version
                      </label>
                      <input
                        {...register('tool_version')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="e.g., 2023.10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Queue
                      </label>
                      <input
                        {...register('queue')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="e.g., Invoice_Processing_Queue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Path
                      </label>
                      <input
                        {...register('path')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="e.g., \\\\server\\automations\\..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Process Details
                      </label>
                      <textarea
                        {...register('process_details')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="Detailed process description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Object Details
                      </label>
                      <textarea
                        {...register('object_details')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="Object-specific details"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shared Folders
                        </label>
                        <input
                          {...register('shared_folders')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder="\\\\shared\\folder"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shared Mailboxes
                        </label>
                        <input
                          {...register('shared_mailboxes')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder="email@company.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* People & Roles Tab */}
              {activeTab === 'people' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">People & Roles</h3>
                    <button
                      type="button"
                      onClick={() => appendPerson({ name: '', role: '' })}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Person
                    </button>
                  </div>
                  
                  {peopleFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          {...register(`people.${index}.name`)}
                          placeholder="Full Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          {...register(`people.${index}.role`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select Role</option>
                          <option value="Project Manager">Project Manager</option>
                          <option value="Project Designer">Project Designer</option>
                          <option value="Developer">Developer</option>
                          <option value="Tester">Tester</option>
                          <option value="Business SPOC">Business SPOC</option>
                          <option value="Business Stakeholder">Business Stakeholder</option>
                          <option value="Applications-App Owner">Applications-App Owner</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        {peopleFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePerson(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Environments Tab */}
              {activeTab === 'environments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Environment Details</h3>
                    <button
                      type="button"
                      onClick={() => appendEnv({ type: '', vdi: '', service_account: '' })}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Environment
                    </button>
                  </div>
                  
                  {envFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 gap-4 mb-3 p-4 border border-gray-200 rounded-md">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Environment Type</label>
                          <select
                            {...register(`environments.${index}.type`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          >
                            <option value="">Select Type</option>
                            <option value="dev">Development</option>
                            <option value="qa">QA</option>
                            <option value="uat">UAT</option>
                            <option value="prod">Production</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">VDI</label>
                          <input
                            {...register(`environments.${index}.vdi`)}
                            placeholder="VDI Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Account</label>
                            <input
                              {...register(`environments.${index}.service_account`)}
                              placeholder="Service Account"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                            />
                          </div>
                          {envFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEnv(index)}
                              className="p-2 text-red-600 hover:text-red-800 mt-6"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'dates' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline & Deployment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pre-Prod Deploy Date
                      </label>
                      <input
                        type="date"
                        {...register('preprod_deploy_date')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prod Deploy Date
                      </label>
                      <input
                        type="date"
                        {...register('prod_deploy_date')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty End Date
                      </label>
                      <input
                        type="date"
                        {...register('warranty_end_date')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Data SPOC
                      </label>
                      <input
                        {...register('test_data.spoc')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="Test Data Team Contact"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QA Handshake
                      </label>
                      <select
                        {...register('qa_handshake')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Required">Not Required</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Tab */}
              {activeTab === 'metrics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Post Production Metrics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Cases
                      </label>
                      <input
                        type="number"
                        {...register('metrics.post_prod_total_cases')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Exceptions Count
                      </label>
                      <input
                        type="number"
                        {...register('metrics.post_prod_sys_ex_count')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Success Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...register('metrics.post_prod_success_rate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="95.50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Artifacts Tab */}
              {activeTab === 'artifacts' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Artifacts & Links</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation Artifacts Link
                      </label>
                      <input
                        type="url"
                        {...register('artifacts.artifacts_link')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code Review with M&E
                        </label>
                        <select
                          {...register('artifacts.code_review')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select Status</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="not_applicable">Not Applicable</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Automation Demo to M&E
                        </label>
                        <select
                          {...register('artifacts.demo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select Status</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="not_applicable">Not Applicable</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rampup/Postprod Issue/Resolution list to M&E
                      </label>
                      <textarea
                        {...register('artifacts.rampup_issue_list')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="List any issues and their resolutions..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Tab */}
              {activeTab === 'additional' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                      </label>
                      <textarea
                        {...register('comments')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="Additional comments"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Documentation
                      </label>
                      <textarea
                        {...register('documentation')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="Documentation links or notes"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeTab !== 'additional' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Automation'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
