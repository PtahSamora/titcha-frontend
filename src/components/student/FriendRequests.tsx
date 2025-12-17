'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, UserPlus } from 'lucide-react';
import { useStore } from '@/lib/store';

interface FriendRequest {
  friendshipId: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  } | null;
  createdAt: string;
}

export function FriendRequests() {
  const { addNotification } = useStore();
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      // Load incoming requests
      const incomingRes = await fetch('/api/friends/requests?type=incoming');
      const incomingData = await incomingRes.json();
      setIncomingRequests(incomingData.requests || []);

      // Load sent requests
      const sentRes = await fetch('/api/friends/requests?type=sent');
      const sentData = await sentRes.json();
      setSentRequests(sentData.requests || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // Poll for new requests every 10 seconds
    const interval = setInterval(loadRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (friendshipId: string, friendName: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add notification about accepting friend request
        addNotification({
          type: 'friend_accepted',
          title: 'Friend Request Accepted!',
          message: `You are now friends with ${friendName}. Start chatting!`,
          read: false,
          metadata: {
            userId: data.friend?.id,
            userName: friendName,
          },
        });

        // Reload requests and friends list
        await loadRequests();
        window.location.reload(); // Reload to update friends list
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        // Reload requests
        await loadRequests();
      }
    } catch (error) {
      console.error('Failed to reject friend request:', error);
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

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (incomingRequests.length === 0 && sentRequests.length === 0) {
    return null; // Hide section if no requests
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">Friend Requests</h3>
        {(incomingRequests.length + sentRequests.length) > 0 && (
          <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
            {incomingRequests.length + sentRequests.length}
          </span>
        )}
      </div>

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Incoming ({incomingRequests.length})</h4>
          <div className="space-y-2">
            {incomingRequests.map((request) => request.user && (
              <motion.div
                key={request.friendshipId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {request.user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.user.displayName}</p>
                    <p className="text-xs text-gray-500">{getTimeAgo(request.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request.friendshipId, request.user!.displayName)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    title="Accept"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReject(request.friendshipId)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Sent ({sentRequests.length})</h4>
          <div className="space-y-2">
            {sentRequests.map((request) => request.user && (
              <motion.div
                key={request.friendshipId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                    {request.user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.user.displayName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending • {getTimeAgo(request.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Waiting...</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
