'use client';

import { MagnifyingGlassIcon, PlusIcon, ViewColumnsIcon, RectangleStackIcon, DocumentArrowUpIcon, TrashIcon, FunnelIcon, DocumentArrowDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function SharedHeader({ 
  searchTerm,
  onSearchChange,
  onClearSearch,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  getUniqueValues,
  viewType,
  onViewTypeChange,
  onAddAutomation,
  onImport,
  isImporting,
  selectedItems,
  onExport,
  showExportDropdown,
  onToggleExportDropdown,
  filterDropdownRef,
  exportDropdownRef,
  isSearching,
  searchResults,
  showSearchResults,
  onClearSearchResults
}) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 flex-1">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Automation Database
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and track automation records
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 text-black rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={onClearSearch}
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
                      onClick={onClearSearchResults}
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
                onClick={() => onToggleFilters(!showFilters)}
                className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  hasActiveFilters 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {Object.entries(filters).filter(([key, value]) => {
                      if (typeof value === 'object' && value !== null) {
                        return value.type !== '' || value.value !== '';
                      }
                      return value !== '';
                    }).length}
                  </span>
                )}
                <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Basic Filter Dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                      {hasActiveFilters && (
                        <button
                          onClick={onClearFilters}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={filters.type}
                          onChange={(e) => onFiltersChange({...filters, type: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
                        >
                          <option value="">All types</option>
                          {getUniqueValues('type').map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                        <select
                          value={filters.complexity}
                          onChange={(e) => onFiltersChange({...filters, complexity: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
                        >
                          <option value="">All complexities</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">COE/FED</label>
                        <select
                          value={filters.coe_fed}
                          onChange={(e) => onFiltersChange({...filters, coe_fed: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
                        >
                          <option value="">All COE/FED</option>
                          {getUniqueValues('coe_fed').map(coe => (
                            <option key={coe} value={coe}>{coe}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <select
                          value={filters.hasDescription}
                          onChange={(e) => onFiltersChange({...filters, hasDescription: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800"
                        >
                          <option value="">All</option>
                          <option value="with">With description</option>
                          <option value="without">Without description</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => onViewTypeChange('slide')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewType === 'slide'
                    ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewTypeChange('tab')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewType === 'tab'
                    ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <RectangleStackIcon className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={onAddAutomation}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>

            <button
              onClick={onImport}
              disabled={isImporting}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
            >
              <DocumentArrowUpIcon className="h-5 w-5" />
            </button>

            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => onToggleExportDropdown(!showExportDropdown)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => onExport('csv', 'filtered')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Export Filtered as CSV
                    </button>
                    <button
                      onClick={() => onExport('json', 'filtered')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Export Filtered as JSON
                    </button>
                    <button
                      onClick={() => onExport('excel', 'filtered')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      Export Filtered as Excel
                    </button>
                    {selectedItems && selectedItems.size > 0 && (
                      <>
                        <hr className="my-2" />
                        <button
                          onClick={() => onExport('csv', 'selected')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded text-blue-700"
                        >
                          Export Selected ({selectedItems.size}) as CSV
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
