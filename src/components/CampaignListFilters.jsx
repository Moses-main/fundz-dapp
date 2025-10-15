import React from 'react';
import { FunnelIcon, ArrowsUpDownIcon, ClockIcon, CurrencyDollarIcon, FireIcon } from '@heroicons/react/24/outline';

export default function CampaignListFilters({ onFilterChange, onSortChange, filters, sortBy }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="successful">Successful</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            name="category"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
            <option value="environment">Environment</option>
            <option value="animals">Animals</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <div className="relative">
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="block appearance-none w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="ending-soon">Ending Soon</option>
              <option value="most-funded">Most Funded</option>
              <option value="most-donors">Most Donors</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ArrowsUpDownIcon className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-end">
          <button
            onClick={() => onFilterChange('reset')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6 sm:mt-0"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Reset Filters
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onSortChange('trending')}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            sortBy === 'trending'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FireIcon className="h-3 w-3 mr-1" />
          Trending
        </button>
        <button
          onClick={() => onSortChange('ending-soon')}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            sortBy === 'ending-soon'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <ClockIcon className="h-3 w-3 mr-1" />
          Ending Soon
        </button>
        <button
          onClick={() => onSortChange('most-funded')}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            sortBy === 'most-funded'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <CurrencyDollarIcon className="h-3 w-3 mr-1" />
          Most Funded
        </button>
      </div>
    </div>
  );
}
