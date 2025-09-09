import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  BarChart2,
  Share2,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Mock data
const mockCampaigns = [
  {
    id: 1,
    title: 'Blockchain Game Development',
    category: 'Gaming',
    goal: 50000,
    raised: 32450,
    backers: 124,
    daysLeft: 12,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    status: 'active',
    isApproved: true
  },
  {
    id: 2,
    title: 'Eco-Friendly Apparel',
    category: 'Fashion',
    goal: 25000,
    raised: 12500,
    backers: 87,
    daysLeft: 5,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016042?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    status: 'active',
    isApproved: true
  },
  {
    id: 3,
    title: 'Smart Home Device',
    category: 'Technology',
    goal: 100000,
    raised: 45000,
    backers: 210,
    daysLeft: 3,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    status: 'ending_soon',
    isApproved: true
  },
  {
    id: 4,
    title: 'Art Exhibition',
    category: 'Art',
    goal: 15000,
    raised: 15000,
    backers: 95,
    daysLeft: 0,
    image: 'https://images.unsplash.com/photo-1531913764164-f85c52d6e654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1433&q=80',
    status: 'successful',
    isApproved: true
  },
  {
    id: 5,
    title: 'Children\'s Book Series',
    category: 'Publishing',
    goal: 5000,
    raised: 1250,
    backers: 12,
    daysLeft: 0,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80',
    status: 'unsuccessful',
    isApproved: true
  },
  {
    id: 6,
    title: 'New Album Recording',
    category: 'Music',
    goal: 20000,
    raised: 0,
    backers: 0,
    daysLeft: 30,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    status: 'draft',
    isApproved: false
  }
];

const statusStyles = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ending_soon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  successful: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  unsuccessful: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const statusIcons = {
  active: <CheckCircle className="w-4 h-4 mr-1" />,
  ending_soon: <AlertCircle className="w-4 h-4 mr-1" />,
  successful: <CheckCircle className="w-4 h-4 mr-1" />,
  unsuccessful: <AlertCircle className="w-4 h-4 mr-1" />,
  draft: <Edit className="w-4 h-4 mr-1" />
};

const MyCampaigns = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || campaign.status === filter || 
                         (filter === 'active' && campaign.status === 'ending_soon');
    
    return matchesSearch && matchesFilter;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;
    if (sortBy === 'most_raised') return b.raised - a.raised;
    if (sortBy === 'most_backers') return b.backers - a.backers;
    return 0;
  });

  const getStatusBadge = (status) => {
    const statusText = status === 'ending_soon' ? 'Ending Soon' : 
                      status === 'successful' ? 'Successful' : 
                      status === 'unsuccessful' ? 'Unsuccessful' : 
                      status === 'draft' ? 'Draft' : 'Active';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusIcons[status]}
        {statusText}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Campaigns</h2>
        <Link
          to="/create-campaign"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create New Campaign
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Campaigns</option>
              <option value="active">Active</option>
              <option value="successful">Successful</option>
              <option value="unsuccessful">Unsuccessful</option>
              <option value="draft">Drafts</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_raised">Most Raised</option>
              <option value="most_backers">Most Backers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCampaigns.length > 0 ? (
          sortedCampaigns.map((campaign) => (
            <div 
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(campaign.status)}
                </div>
                {!campaign.isApproved && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Pending Approval
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {campaign.title}
                  </h3>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {campaign.category}
                </p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>Raised</span>
                    <span className="font-medium">
                      ${campaign.raised.toLocaleString()} of ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (campaign.raised / campaign.goal) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{campaign.backers} backers</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/campaigns/${campaign.id}/edit`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="-ml-1 mr-2 h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    to={`/campaigns/${campaign.id}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <BarChart2 className="-ml-1 mr-2 h-4 w-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No campaigns found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Get started by creating a new campaign.'}
            </p>
            <div className="mt-6">
              <Link
                to="/create-campaign"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Campaign
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;
