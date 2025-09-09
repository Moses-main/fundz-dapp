import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Moon,
  Sun,
  Check,
  X,
  Save,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Blockchain enthusiast and creator of amazing projects on Fundloom.",
    walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    emailNotifications: true,
    marketingEmails: false,
    pushNotifications: true,
    twoFactorAuth: false,
    currency: "USD",
    language: "en",
    timezone: "America/New_York",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const tabs = [
    {
      id: "profile",
      name: "Profile",
      icon: <User size={16} className="mr-2" />,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: <Bell size={16} className="mr-2" />,
    },
    {
      id: "security",
      name: "Security",
      icon: <Shield size={16} className="mr-2" />,
    },
    {
      id: "preferences",
      name: "Preferences",
      icon: <Globe size={16} className="mr-2" />,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      setIsSaved(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }, 1000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <User size={32} className="text-gray-400" />
                </div>
                <button className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full">
                  <Edit2 size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Brief description for your profile.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">Wallet Address</h3>
              <div className="flex items-center">
                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 text-sm font-mono overflow-x-auto">
                  {formData.walletAddress}
                </div>
                <button
                  onClick={() => copyToClipboard(formData.walletAddress)}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md text-sm font-medium"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This is your public wallet address. It's used to receive funds
                from your campaigns.
              </p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h3>
                <div className="mt-5">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        Campaign updates
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when there's activity on your campaigns.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        Marketing emails
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive updates about new features and products.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={formData.marketingEmails}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        Push notifications
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive push notifications on your device.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={formData.pushNotifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Notification Preferences
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize how you receive notifications for different types
                    of activities.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="comments"
                        name="comments"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="comments"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Comments on my campaigns
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="mentions"
                        name="mentions"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="mentions"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Mentions
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="milestones"
                        name="milestones"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="milestones"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Funding milestones
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    Add an extra layer of security to your account by enabling
                    two-factor authentication.
                  </p>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Status:
                        <span
                          className={
                            formData.twoFactorAuth
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500"
                          }
                        >
                          {formData.twoFactorAuth ? " Active" : " Inactive"}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        formData.twoFactorAuth
                          ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          twoFactorAuth: !prev.twoFactorAuth,
                        }))
                      }
                    >
                      {formData.twoFactorAuth ? "Disable 2FA" : "Enable 2FA"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Change Password
                </h3>
                <div className="mt-5">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Current password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="password"
                          name="current-password"
                          id="current-password"
                          className="block w-full pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        New password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="password"
                          name="new-password"
                          id="new-password"
                          className="block w-full pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Confirm new password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          className="block w-full pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update password
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Connected Wallets
                </h3>
                <div className="mt-5">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formData.walletAddress.substring(0, 6)}...
                          {formData.walletAddress.substring(38)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Connected on {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="-ml-0.5 mr-2 h-4 w-4" />
                      Connect another wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Danger Zone
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>
                      Deleting your account will permanently remove all of your
                      data, including campaigns and contributions. This action
                      cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete my account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Appearance
                </h3>
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Theme
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customize how Fundloom looks on your device.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          toggleTheme("light");
                          setFormData((prev) => ({ ...prev, theme: "light" }));
                        }}
                        className={`p-2 rounded-md ${
                          theme === "light"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title="Light mode"
                      >
                        <Sun className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleTheme("dark");
                          setFormData((prev) => ({ ...prev, theme: "dark" }));
                        }}
                        className={`p-2 rounded-md ${
                          theme === "dark"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title="Dark mode"
                      >
                        <Moon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const prefersDark = window.matchMedia(
                            "(prefers-color-scheme: dark)"
                          ).matches;
                          toggleTheme(prefersDark ? "dark" : "light");
                          setFormData((prev) => ({ ...prev, theme: "system" }));
                        }}
                        className={`p-2 rounded-md ${
                          formData.theme === "system"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title="System preference"
                      >
                        <div className="relative h-5 w-5">
                          <Sun className="h-4 w-4 absolute top-0.5 left-0.5" />
                          <Moon className="h-4 w-4 absolute bottom-0.5 right-0.5" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Language & Region
                </h3>
                <div className="mt-5">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="language"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="timezone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="America/New_York">
                          Eastern Time (ET)
                        </option>
                        <option value="America/Chicago">
                          Central Time (CT)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT)
                        </option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                        <option value="JPY">Japanese Yen (JPY)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="BTC">Bitcoin (BTC)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Data & Privacy
                </h3>
                <div className="mt-5">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="data-collection"
                          name="data-collection"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="data-collection"
                          className="font-medium text-gray-700 dark:text-gray-300"
                        >
                          Allow data collection to improve Fundloom
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          This helps us improve our services and provide a
                          better experience for all users.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="personalized-ads"
                          name="personalized-ads"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="personalized-ads"
                          className="font-medium text-gray-700 dark:text-gray-300"
                        >
                          Personalized advertising
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Show me relevant ads based on my activity and
                          interests.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Download className="-ml-1 mr-2 h-4 w-4" />
                        Download my data
                      </button>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Download a copy of all your personal data stored on
                        Fundloom.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:block">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500"
                } whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderTabContent()}

        {(activeTab === "profile" || isEditing) && (
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="-ml-1 mr-2 h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit2 className="-ml-1 mr-2 h-4 w-4" />
                  Edit profile
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {isSaved && (
        <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Changes saved
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your settings have been updated successfully.
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsSaved(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
