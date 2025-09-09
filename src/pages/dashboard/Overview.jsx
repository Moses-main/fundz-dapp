import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  BarChart2,
  PieChart,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Pie,
  Cell,
  Legend
} from 'recharts';

// Mock data
const summaryData = [
  {
    title: 'Total Raised',
    value: '$12,450',
    change: '+12.5%',
    isPositive: true,
    icon: <DollarSign className="text-green-500" size={20} />
  },
  {
    title: 'Active Campaigns',
    value: '8',
    change: '+2',
    isPositive: true,
    icon: <TrendingUp className="text-blue-500" size={20} />
  },
  {
    title: 'Total Backers',
    value: '124',
    change: '+24',
    isPositive: true,
    icon: <Users className="text-purple-500" size={20} />
  },
  {
    title: 'Avg. Time Left',
    value: '12d',
    change: '-3d',
    isPositive: false,
    icon: <Clock className="text-amber-500" size={20} />
  }
];

const fundingData = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 5000 },
  { name: 'Apr', amount: 2780 },
  { name: 'May', amount: 1890 },
  { name: 'Jun', amount: 2390 },
  { name: 'Jul', amount: 3490 },
];

const categoryData = [
  { name: 'Technology', value: 400 },
  { name: 'Art', value: 300 },
  { name: 'Gaming', value: 200 },
  { name: 'Other', value: 100 },
];

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

const Overview = () => {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{item.value}</p>
                <div className={`flex items-center mt-2 ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {item.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span className="text-sm ml-1">{item.change}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <BarChart2 className="mr-2" size={18} />
              Funding Over Time
            </h3>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              View All
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#4B5563', fontWeight: 500 }}
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#6366F1" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <PieChart className="mr-2" size={18} />
              Campaign Categories
            </h3>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              View All
            </button>
          </div>
          <div className="h-80 flex flex-col items-center justify-center">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `$${value}`, 
                      props.payload.name
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <TrendingUpIcon className="mr-2" size={18} />
            Recent Activity
          </h3>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                <DollarSign size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New contribution received</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">You've received $500 for "Blockchain Game Development"</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">+$500</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
