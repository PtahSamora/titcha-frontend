'use client';

import React from 'react';
import { useStore, Notification } from '@/lib/store';
import { motion } from 'framer-motion';
import { X, Check, Trash2, UserPlus, Users, Trophy, Bell as BellIcon, Clipboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearNotifications } = useStore();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'group_invite':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'homework_due':
        return <Clipboard className="h-5 w-5 text-orange-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <button
            onClick={markAllAsRead}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={clearNotifications}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BellIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No notifications yet</p>
            <p className="text-sm text-gray-500">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                  !notification.read ? 'bg-purple-50/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
