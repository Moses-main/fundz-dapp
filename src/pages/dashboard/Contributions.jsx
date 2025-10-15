import React, { useState } from "react";
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

// Mock data
const mockContributions = [
  {
    id: "cont-001",
    campaignId: "camp-001",
    campaignTitle: "Blockchain Game Development",
    campaignImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    amount: 500,
    currency: "ETH",
    amountUSD: 1000,
    date: "2023-10-15T14:30:00Z",
    status: "confirmed",
    isRefundable: true,
    refundDeadline: "2023-11-15T23:59:59Z",
    perks: ["Early Access", "Discord Role"],
  },
  {
    id: "cont-002",
    campaignId: "camp-002",
    campaignTitle: "Eco-Friendly Apparel",
    campaignImage:
      "https://images.unsplash.com/photo-1445205170230-053b83016042?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    amount: 100,
    currency: "USDC",
    amountUSD: 100,
    date: "2023-10-10T09:15:00Z",
    status: "confirmed",
    isRefundable: false,
    perks: ["T-Shirt"],
  },
  {
    id: "cont-003",
    campaignId: "camp-003",
    campaignTitle: "Smart Home Device",
    campaignImage:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    amount: 250,
    currency: "ETH",
    amountUSD: 500,
    date: "2023-10-05T16:45:00Z",
    status: "pending",
    isRefundable: false,
    perks: ["Early Bird Price"],
  },
  {
    id: "cont-004",
    campaignId: "camp-004",
    campaignTitle: "Art Exhibition",
    campaignImage:
      "https://images.unsplash.com/photo-1531913764164-f85c52d6e654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1433&q=80",
    amount: 50,
    currency: "USDC",
    amountUSD: 50,
    date: "2023-09-28T11:20:00Z",
    status: "refunded",
    isRefundable: false,
    refundDate: "2023-10-05T10:30:00Z",
    perks: ["VIP Invitation"],
  },
];

const statusStyles = {
  confirmed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusIcons = {
  confirmed: <CheckCircle className="w-4 h-4 mr-1" />,
  pending: <Clock className="w-4 h-4 mr-1" />,
  refunded: <ArrowUpRight className="w-4 h-4 mr-1" />,
  failed: <XCircle className="w-4 h-4 mr-1" />,
};

const Contributions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredContributions = mockContributions.filter((contribution) => {
    const matchesSearch = contribution.campaignTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || contribution.status === filter;
    return matchesSearch && matchesFilter;
  });

  const sortedContributions = [...filteredContributions].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
    if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
    if (sortBy === "highest") return b.amountUSD - a.amountUSD;
    if (sortBy === "lowest") return a.amountUSD - b.amountUSD;
    return 0;
  });

  const getStatusBadge = (status) => {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {statusIcons[status]}
        {statusText}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = Math.max(0, end - now);

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return `${days}d ${hours}h left`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Contributions
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your contributions and manage your support
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Contributed
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              $1,650.00
            </p>
          </div>
        </div>
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
            placeholder="Search contributions..."
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
              <option value="all">All Contributions</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
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
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributions List */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {sortedContributions.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedContributions.map((contribution) => (
              <li
                key={contribution.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={contribution.campaignImage}
                          alt={contribution.campaignTitle}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {contribution.campaignTitle}
                        </h3>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:items-center">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatDate(contribution.date)}</span>
                            {contribution.refundDate && (
                              <span className="hidden sm:inline-block mx-2">
                                •
                              </span>
                            )}
                            {contribution.refundDate && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                Refunded on{" "}
                                {new Date(
                                  contribution.refundDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {contribution.amount} {contribution.currency}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${contribution.amountUSD.toFixed(2)} USD
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(contribution.status)}
                      {contribution.isRefundable &&
                        contribution.status === "confirmed" && (
                          <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeRemaining(contribution.refundDeadline)}
                          </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {contribution.perks && contribution.perks.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">Perks:</span>
                          <div className="flex flex-wrap gap-1">
                            {contribution.perks.map((perk, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200"
                              >
                                {perk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </button>

                      {contribution.isRefundable &&
                        contribution.status === "confirmed" && (
                          <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Request Refund
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No contributions found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || filter !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "You haven't made any contributions yet. Explore campaigns to get started."}
            </p>
            <div className="mt-6">
              <a
                href="/campaigns"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowUpRight className="-ml-1 mr-2 h-5 w-5" />
                Browse Campaigns
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contributions;
