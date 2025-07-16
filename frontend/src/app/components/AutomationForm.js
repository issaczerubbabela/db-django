'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AutomationForm({ isOpen, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      data.modified = new Date().toISOString().split('T')[0];
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
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

          {/* Form */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
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
                    Type *
                  </label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Type</option>
                    <option value="Document Processing">Document Processing</option>
                    <option value="HR Process">HR Process</option>
                    <option value="Reporting">Reporting</option>
                    <option value="Data Entry">Data Entry</option>
                    <option value="Communication">Communication</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tool
                  </label>
                  <input
                    {...register('tool')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., UiPath, Power Automate"
                  />
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
              </div>

              {/* Description and Details */}
              <div className="space-y-4">
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
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Object details"
                  />
                </div>
              </div>

              {/* People Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                  <button
                    type="button"
                    onClick={() => appendPerson({ name: '', role: '' })}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Person
                  </button>
                </div>
                
                {peopleFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 mb-3">
                    <div className="flex-1">
                      <input
                        {...register(`people.${index}.name`)}
                        placeholder="Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="flex-1">
                      <select
                        {...register(`people.${index}.role`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Select Role</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Developer">Developer</option>
                        <option value="Tester">Tester</option>
                        <option value="Business SPOC">Business SPOC</option>
                        <option value="Architect">Architect</option>
                      </select>
                    </div>
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
                ))}
              </div>

              {/* Environments Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Environments</h3>
                  <button
                    type="button"
                    onClick={() => appendEnv({ type: '', vdi: '', service_account: '' })}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Environment
                  </button>
                </div>
                
                {envFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 gap-4 mb-3">
                    <select
                      {...register(`environments.${index}.type`)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Environment Type</option>
                      <option value="Dev">Dev</option>
                      <option value="QA">QA</option>
                      <option value="UAT">UAT</option>
                      <option value="Prod">Prod</option>
                    </select>
                    <input
                      {...register(`environments.${index}.vdi`)}
                      placeholder="VDI"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    />
                    <div className="flex gap-2">
                      <input
                        {...register(`environments.${index}.service_account`)}
                        placeholder="Service Account"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      />
                      {envFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEnv(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional fields */}
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
                    Test Data SPOC
                  </label>
                  <input
                    {...register('test_data.spoc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Test Data Team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documentation
                  </label>
                  <input
                    {...register('documentation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Documentation location or notes"
                  />
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  {...register('comments')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Additional comments"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Automation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
