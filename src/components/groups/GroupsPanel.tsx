'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGroupsStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { GroupCreateModal } from './GroupCreateModal';

export function GroupsPanel() {
  const { data: session } = useSession();
  const { groups, loadGroups, openGroup } = useGroupsStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadGroups();
    }
  }, [session]);

  const handleOpenGroup = (groupId: string) => {
    openGroup(groupId);
  };

  const handleGroupCreated = (groupId: string) => {
    loadGroups();
    openGroup(groupId);
  };

  // Show only the 5 most recent groups
  const recentGroups = groups.slice(0, 5);

  return (
    <div className="groups-panel bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900">My Groups</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </button>
      </div>

      {recentGroups.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-sm mb-2">No groups yet</p>
          <p className="text-gray-400 text-xs mb-4">
            Create a group to collaborate with friends
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recentGroups.map((group) => (
            <motion.button
              key={group.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenGroup(group.id)}
              className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {group.memberUserIds.length} member{group.memberUserIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}

          {groups.length > 5 && (
            <p className="text-center text-xs text-gray-500 pt-2">
              +{groups.length - 5} more group{groups.length - 5 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Group Create Modal */}
      <GroupCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
