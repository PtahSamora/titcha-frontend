'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '@/lib/store';
import { NotificationsPanel } from './NotificationsPanel';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  const notifications = useStore((state) => state.notifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* Notifications Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 z-50"
            >
              <NotificationsPanel onClose={() => setShowPanel(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
