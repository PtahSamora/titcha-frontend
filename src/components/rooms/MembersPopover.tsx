'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/lib/toast';

interface Member {
  id: string;
  displayName: string;
  email: string;
  isOwner: boolean;
  hasControl: boolean;
  online?: boolean;
}

interface MembersPopoverProps {
  roomId: string;
  members: Member[];
  control: {
    controllerUserId: string | null;
  };
  permissions: {
    askAiEnabled: boolean;
    memberAskAi: string[];
  };
  me: {
    id: string;
    isOwner: boolean;
  };
  socket: any;
  onClose: () => void;
  onOpenGroupChat: () => void;
}

export function MembersPopover({
  roomId,
  members,
  control,
  permissions: initialPermissions,
  me,
  socket,
  onClose,
  onOpenGroupChat,
}: MembersPopoverProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState(initialPermissions);

  const getMemberName = (userId: string) => {
    return members.find((m) => m.id === userId)?.displayName || 'Unknown';
  };

  const toggleAiEnabled = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ askAiEnabled: !permissions.askAiEnabled }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPermissions(data.data);
        socket.emit('perm:broadcast', { roomId, permissions: data.data });
        toast.success(
          data.data.askAiEnabled
            ? 'AI is now enabled for this room'
            : 'AI is now disabled for this room'
        );
      } else {
        toast.error(data.message || 'Failed to update AI settings');
      }
    } catch (error) {
      toast.error('Failed to update AI settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberAiPermission = async (memberId: string) => {
    const hasPermission = permissions.memberAskAi.includes(memberId);
    setLoading(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          hasPermission
            ? { revokeUserId: memberId }
            : { grantUserId: memberId }
        ),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPermissions(data.data);
        socket.emit('perm:broadcast', { roomId, permissions: data.data });
        const memberName = getMemberName(memberId);
        toast.success(
          hasPermission
            ? `Removed AI permission from ${memberName}`
            : `Gave AI permission to ${memberName}`
        );
      } else {
        toast.error(data.message || 'Failed to update member permission');
      }
    } catch (error) {
      toast.error('Failed to update member permission');
    } finally {
      setLoading(false);
    }
  };

  const canMemberAskAi = (memberId: string) => {
    if (memberId === me.id && me.isOwner) return true; // Owner always can
    if (!permissions.askAiEnabled) return false; // AI disabled globally
    if (permissions.memberAskAi.length === 0) return true; // No whitelist = all can
    return permissions.memberAskAi.includes(memberId); // Check whitelist
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      />

      {/* Popover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed top-20 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">Room Members</h3>
              <p className="text-xs text-gray-600">{members.length} total</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* AI Controls (Owner Only) */}
          {me.isOwner && (
            <div className="pt-3 border-t border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">🤖 AI Assistant</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${permissions.askAiEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {permissions.askAiEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={toggleAiEnabled}
                  disabled={loading}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                    permissions.askAiEnabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {permissions.askAiEnabled ? 'Disable AI' : 'Enable AI'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {permissions.askAiEnabled
                  ? 'Click members below to manage individual permissions'
                  : 'AI is disabled for all members'}
              </p>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="max-h-96 overflow-y-auto">
          {members.map((member) => {
            const memberCanAskAi = canMemberAskAi(member.id);
            return (
            <div
              key={member.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                memberCanAskAi && permissions.askAiEnabled ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    member.isOwner
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                      : member.hasControl
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {member.displayName}
                    </span>
                    {member.isOwner && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                        👑 Owner
                      </span>
                    )}
                    {memberCanAskAi && permissions.askAiEnabled && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                        🤖 Can Ask AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{member.email}</p>
                </div>

                {/* Online Status */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    member.online ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  title={member.online ? 'Online' : 'Offline'}
                />
              </div>

              {/* AI Permission Toggle (Owner Only, Non-Owner Members) */}
              {me.isOwner && !member.isOwner && permissions.askAiEnabled && (
                <div className="mt-2">
                  {permissions.memberAskAi.includes(member.id) || permissions.memberAskAi.length === 0 ? (
                    <button
                      onClick={() => toggleMemberAiPermission(member.id)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>🚫</span>
                      <span>Remove AI Permission</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleMemberAiPermission(member.id)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>✅</span>
                      <span>Give AI Permission</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onOpenGroupChat}
            className="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>Open Group Chat</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
