import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Download,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Eye,
  Pencil,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Settings,
  CreditCard,
  Package,
  DollarSign,
  Zap,
  Clock3,
  ArrowUpDown,
  ArrowDownUp,
  ChevronRight,
  ChevronLeft,
  Sliders,
  ListFilter,
  BarChart2,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  LabelList,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// Custom components
const StatCard = ({ title, value, change, icon: Icon, color = "indigo" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/30 dark:to-${color}-800/20 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-${color}-100 dark:border-${color}-800/50`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <div className="mt-2 flex items-baseline">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
          {change && (
            <span
              className={`ml-2 text-sm font-medium ${
                change.startsWith("+")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {change}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
  </motion.div>
);

const TableCard = ({ title, children, action }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {action && (
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
          View all <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      )}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700/50 ${className}`}
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    <div className="h-80">{children}</div>
  </div>
);

// Custom color palette
const COLORS = {
  primary: "#4f46e5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

// Mock data for admin dashboard
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    joined: "2023-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    joined: "2023-02-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    status: "suspended",
    joined: "2023-03-10",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    role: "user",
    status: "pending",
    joined: "2023-04-05",
  },
];

const mockCampaigns = [
  {
    id: 1,
    title: "Blockchain Game Dev",
    creator: "John Doe",
    status: "active",
    raised: 5.2,
    goal: 10,
    backers: 42,
  },
  {
    id: 2,
    title: "Eco Apparel",
    creator: "Jane Smith",
    status: "pending",
    raised: 0,
    goal: 5,
    backers: 0,
  },
  {
    id: 3,
    title: "Smart Home Device",
    creator: "Bob Johnson",
    status: "suspended",
    raised: 1.5,
    goal: 20,
    backers: 8,
  },
  {
    id: 4,
    title: "Art Exhibition",
    creator: "Alice Williams",
    status: "completed",
    raised: 2.5,
    goal: 2.5,
    backers: 15,
  },
];

// Mock data for charts
const chartData = [
  { name: "Jan", users: 4000, campaigns: 2400, amount: 2400 },
  { name: "Feb", users: 3000, campaigns: 1398, amount: 2210 },
  { name: "Mar", users: 2000, campaigns: 9800, amount: 2290 },
  { name: "Apr", users: 2780, campaigns: 3908, amount: 2000 },
  { name: "May", users: 1890, campaigns: 4800, amount: 2181 },
  { name: "Jun", users: 2390, campaigns: 3800, amount: 2500 },
  { name: "Jul", users: 3490, campaigns: 4300, amount: 2100 },
];

const pieData = [
  { name: "Active", value: 45, color: "#10B981" },
  { name: "Pending", value: 25, color: "#F59E0B" },
  { name: "Suspended", value: 15, color: "#EF4444" },
  { name: "Completed", value: 15, color: "#3B82F6" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [dateRange, setDateRange] = useState("7days");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Get current date for header
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Tabs for the dashboard
  const tabs = [
    {
      id: "dashboard",
      name: "Overview",
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
      color: "indigo",
    },
    {
      id: "users",
      name: "Users",
      icon: <Users className="h-4 w-4 mr-2" />,
      count: mockUsers.length,
      color: "emerald",
    },
    {
      id: "campaigns",
      name: "Campaigns",
      icon: <FolderKanban className="h-4 w-4 mr-2" />,
      count: mockCampaigns.length,
      color: "violet",
    },
    {
      id: "reports",
      name: "Analytics",
      icon: <PieChartIcon className="h-4 w-4 mr-2" />,
      color: "amber",
    },
  ];

  // Stats for the dashboard with enhanced data
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "indigo",
      trend: [30, 40, 45, 50, 49, 60, 70, 91, 125, 150, 180, 200],
    },
    {
      title: "Active Campaigns",
      value: "42",
      change: "+5%",
      changeType: "increase",
      icon: Activity,
      color: "emerald",
      trend: [10, 15, 12, 18, 22, 25, 28, 30, 35, 38, 40, 42],
    },
    {
      title: "Total Volume",
      value: "245.5 ETH",
      change: "+18%",
      changeType: "increase",
      icon: DollarSign,
      color: "violet",
      trend: [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 245.5],
    },
    {
      title: "Avg. Donation",
      value: "0.15 ETH",
      change: "-2%",
      changeType: "decrease",
      icon: CreditCard,
      color: "amber",
      trend: [
        0.18, 0.17, 0.16, 0.15, 0.14, 0.15, 0.14, 0.15, 0.16, 0.15, 0.15, 0.15,
      ],
    },
  ];

  // Recent activity data with more details
  const recentActivity = [
    {
      id: 1,
      user: "John Doe",
      action: "created a new campaign",
      details: "Save the Whales Initiative",
      time: "2 min ago",
      type: "campaign",
      icon: <FolderKanban className="h-4 w-4 text-blue-500" />,
      status: "completed",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "backed a project",
      details: "1.5 ETH",
      time: "1 hour ago",
      type: "donation",
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      status: "completed",
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "withdrew funds",
      details: "5 ETH",
      time: "3 hours ago",
      type: "withdrawal",
      icon: <ArrowUpRight className="h-4 w-4 text-red-500" />,
      status: "pending",
    },
    {
      id: 4,
      user: "Alice Williams",
      action: "updated profile",
      details: "New profile picture",
      time: "5 hours ago",
      type: "profile",
      icon: <UserCheck className="h-4 w-4 text-purple-500" />,
      status: "completed",
    },
    {
      id: 5,
      user: "Charlie Brown",
      action: "reported an issue",
      details: "Bug in campaign creation",
      time: "1 day ago",
      type: "report",
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      status: "pending",
    },
  ];

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCampaignSelect = (campaignId) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleBulkAction = (action) => {
    // Handle bulk actions (approve, suspend, delete)
    console.log(`${action} selected items:`, {
      users: selectedUsers,
      campaigns: selectedCampaigns,
    });
  };

  const renderStatusBadge = (status) => {
    const statusStyles = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      completed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      verified:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      unverified:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status.toLowerCase()] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const renderChart = useCallback(() => {
    if (activeTab === "reports") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              User Growth
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#4f46e5"
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Campaign Status
            </h3>
            <div className="h-80 flex items-center justify-center">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-1 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Campaign Performance
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="campaigns" name="Campaigns" fill="#8b5cf6" />
                  <Bar dataKey="amount" name="Amount (ETH)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }, [activeTab]);

  const renderDashboardOverview = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    New campaign created: "Blockchain Game Dev"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 text-right">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View all activity
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  FundLoom Admin
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentDate}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Settings className="h-5 w-5" />
              </button>

              <div className="relative">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                    {localStorage
                      .getItem("walletAddress")
                      ?.substring(0, 2)
                      .toUpperCase() || "AD"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <nav className="flex flex-col space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.id
                        ? "bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                    {tab.count && (
                      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>{" "}
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`font-medium ${
                    stat.changeType === "increase"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.change}
                </span>{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  from last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto pb-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {mockUsers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`${
                activeTab === "campaigns"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              Campaigns
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {mockCampaigns.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`${
                activeTab === "reports"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </button>
          </nav>

          {activeTab === "reports" && (
            <div className="flex space-x-2">
              <select
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                defaultValue="last-30-days"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="this-year">This year</option>
              </select>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Search and filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
              defaultValue="all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {selectedUsers.length > 0 || selectedCampaigns.length > 0 ? (
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => handleBulkAction("approve")}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                onClick={() => handleBulkAction("suspend")}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Suspend
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => handleBulkAction("delete")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {activeTab === "users" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(mockUsers.map((user) => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.role === "admin" ? (
                          <ShieldAlert className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "campaigns" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns(
                            mockCampaigns.map((campaign) => campaign.id)
                          );
                        } else {
                          setSelectedCampaigns([]);
                        }
                      }}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Campaign
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Creator
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Raised / Goal
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Backers
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={() => handleCampaignSelect(campaign.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {campaign.creator}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {campaign.raised} / {campaign.goal} ETH
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (campaign.raised / campaign.goal) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {campaign.backers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "reports" ? (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generate and view detailed reports about platform activity, user
              engagement, and campaign performance.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        User Activity
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track user signups, logins, and activity
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
              {/* Add more report cards as needed */}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Admin Dashboard Overview
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome to the admin dashboard. Use the tabs above to manage
              users, campaigns, and view reports.
            </p>
            <div className="mt-8">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setActiveTab("users")}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Approve Users
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Review and approve pending user registrations
                  </p>
                </button>
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setActiveTab("campaigns")}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Review Campaigns
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Approve or reject new campaign submissions
                  </p>
                </button>
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setActiveTab("reports")}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    View Reports
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Generate platform analytics and reports
                  </p>
                </button>
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => navigate("/settings")}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Platform Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure platform settings and preferences
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">10</span> of{" "}
              <span className="font-medium">20</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
