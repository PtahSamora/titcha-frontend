'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import type { GroupChat } from '@/lib/types';

interface AddToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendId: string;
  friendName: string;
  friendEmail: string;
}

export function AddToGroupModal({ isOpen, onClose, friendId, friendName, friendEmail }: AddToGroupModalProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredGroups(groups.filter(g => g.name.toLowerCase().includes(query)));
    } else {
      setFilteredGroups(groups);
    }
  }, [searchQuery, groups]);

  const loadGroups = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/groups/list');
      const data = await response.json();

      if (response.ok && data.success) {
        setGroups(data.data || []);
        setFilteredGroups(data.data || []);
      } else {
        setError(data.message || 'Failed to load groups');
      }
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = async (groupId: string, groupName: string) => {
    setAdding(groupId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/groups/${groupId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: friendEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Added ${friendName} to ${groupName}`);
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1500);
      } else {
        setError(data.message || 'Failed to add to group');
      }
    } catch (err) {
      setError('Failed to add to group');
    } finally {
      setAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add to Group</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Add <span className="font-semibold">{friendName}</span> to one of your groups
          </p>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Groups List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{group.name}</p>
                    <p className="text-xs text-gray-500">
                      {group.memberUserIds.length} member{group.memberUserIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToGroup(group.id, group.name)}
                    disabled={adding === group.id}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {adding === group.id ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
