'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriendsStore, useStore } from '@/lib/store';
import { getPresenceSocket } from '@/lib/socket';
import { useSession } from 'next-auth/react';

interface Friend {
  id: string;
  email: string;
  displayName: string;
  role: string;
  online?: boolean;
}

export function FriendsBar() {
  const { data: session } = useSession();
  const { friends, onlineMap, loadFriends, setOnlineStatus, openDM, addFriend } = useFriendsStore();
  const { addNotification } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadFriends();

      // Connect to presence socket
      const socket = getPresenceSocket();
      socket.connect();

      // Listen for presence updates
      socket.on('presence:update', ({ userId, online }: { userId: string; online: boolean }) => {
        setOnlineStatus(userId, online);
      });

      return () => {
        socket.off('presence:update');
      };
    }
  }, [session]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await addFriend(friendEmail);

      // Add notification about sending friend request
      if (result.friend) {
        addNotification({
          type: 'friend_request',
          title: 'Friend Request Sent!',
          message: `Your friend request has been sent to ${result.friend.displayName}. Waiting for them to accept.`,
          read: false,
          metadata: {
            userId: result.friend.id,
            userName: result.friend.displayName,
          },
        });
      }

      setSuccess(`Friend request sent to ${result.friend?.displayName || friendEmail}!`);
      setFriendEmail('');

      // Close modal after 2 seconds to show success message
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
        // Reload page to show pending request
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const friendsWithStatus: Friend[] = friends.map(f => ({
    ...f,
    online: onlineMap[f.id] || false,
  }));

  return (
    <div className="friends-bar bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-sm font-semibold text-gray-700 flex-shrink-0">Friends:</span>

          {friendsWithStatus.length === 0 && (
            <span className="text-sm text-gray-500 italic">No friends yet</span>
          )}

          {friendsWithStatus.map((friend) => (
            <motion.button
              key={friend.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openDM(friend.id)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {friend.displayName.charAt(0).toUpperCase()}
                </div>
                {/* Online status dot */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    friend.online ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={friend.online ? 'Online' : 'Offline'}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">{friend.displayName}</span>
            </motion.button>
          ))}

          {/* Add Friend Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-shrink-0 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Friend</h2>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Friend's Email
                </label>
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="friend@school.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Friend'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
