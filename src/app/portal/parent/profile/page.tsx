'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, CreditCard, Bell, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock parent data
const mockParent = {
  name: "Mrs. Dlamini",
  email: "mdlamini@example.com",
  passwordLastChanged: "2025-09-15",
};

// Mock subscription data
const mockPlan = {
  plan: "Premium Family Plan",
  seats: 3,
  used: 2,
  renews: "2025-11-01",
  price: "R149 / month",
  payment: "Visa ending in 4321",
};

export default function ParentProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'notifications'>('account');

  // Account form state
  const [accountForm, setAccountForm] = useState({
    name: mockParent.name,
    email: mockParent.email,
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    homeworkUpdates: true,
    progressReports: true,
    aiInsights: false,
    billingReminders: true,
  });

  const handleSaveAccount = () => {
    console.log('Saving account changes:', accountForm);
    alert('Account settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification preferences:', notifications);
    alert('Notification preferences saved successfully!');
  };

  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Parent Portal</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/portal/parent/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              Dashboard
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={() => router.push('/portal/parent/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mt-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Manage your account, subscription, and preferences</p>
        </motion.div>

        {/* Tabbed Content */}
        <div className="w-full max-w-3xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg mb-4 p-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'account'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'subscription'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Subscription
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Account Section */}
            {activeTab === 'account' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="password"
                        value="**********"
                        disabled
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Change Password
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Last changed: {mockParent.passwordLastChanged}
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveAccount}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all mt-6"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Subscription & Billing Section */}
            {activeTab === 'subscription' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subscription & Billing</h3>
                <div className="space-y-4">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{mockPlan.plan}</h4>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{mockPlan.price}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Seats Used</p>
                        <p className="font-semibold text-gray-900">
                          {mockPlan.used} of {mockPlan.seats}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Renews On</p>
                        <p className="font-semibold text-gray-900">{mockPlan.renews}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <span className="text-gray-700">{mockPlan.payment}</span>
                      </div>
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                      Upgrade Plan
                    </button>
                    <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Manage Payment
                    </button>
                  </div>

                  {/* Billing History */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Billing History</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Oct 1, 2025</span>
                        <span className="font-medium text-gray-900">R149.00</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Sep 1, 2025</span>
                        <span className="font-medium text-gray-900">R149.00</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Aug 1, 2025</span>
                        <span className="font-medium text-gray-900">R149.00</span>
                      </div>
                    </div>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-3">
                      View All Invoices →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeTab === 'notifications' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose how you want to be notified about your children's progress and updates.
                </p>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <label className="font-medium text-gray-900 cursor-pointer">
                          {formatLabel(key)}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {key === 'homeworkUpdates' && 'Get notified when homework is assigned or completed'}
                          {key === 'progressReports' && 'Weekly reports on your children\'s learning progress'}
                          {key === 'aiInsights' && 'AI-generated insights and recommendations'}
                          {key === 'billingReminders' && 'Reminders about upcoming payments and renewals'}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}

                  {/* Save Button */}
                  <button
                    onClick={handleSaveNotifications}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all mt-6"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
