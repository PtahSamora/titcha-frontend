'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useFriendsStore, useStore } from '@/lib/store';

interface Member {
  id: string;
  email: string;
  displayName: string;
}

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (groupId: string) => void;
  initialMembers?: Member[];
}

export function GroupCreateModal({ isOpen, onClose, onGroupCreated, initialMembers = [] }: GroupCreateModalProps) {
  const { data: session } = useSession();
  const { friends, loadFriends } = useFriendsStore();
  const { addNotification } = useStore();
  const [groupName, setGroupName] = useState('');
  const [subject, setSubject] = useState('');
  const [createStudyRoom, setCreateStudyRoom] = useState(true);
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showFriendsDropdown, setShowFriendsDropdown] = useState(false);

  // Load friends when modal opens
  useEffect(() => {
    if (isOpen && session?.user) {
      loadFriends();
    }
  }, [isOpen, session]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setSearchError('');

    try {
      // Find user by email
      const response = await fetch(`/api/friends/search?email=${encodeURIComponent(memberEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        setSearchError(data.error || 'User not found');
        return;
      }

      // Check if already added
      if (members.some(m => m.email === data.user.email)) {
        setSearchError('User already added');
        return;
      }

      setMembers([...members, data.user]);
      setMemberEmail('');
    } catch (err) {
      setSearchError('Failed to find user');
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleAddFriendFromList = (friend: Member) => {
    // Check if already added
    if (members.some(m => m.email === friend.email)) {
      setSearchError('User already added');
      return;
    }
    setMembers([...members, friend]);
    setShowFriendsDropdown(false);
  };

  // Filter friends not already added
  const availableFriends = friends.filter(f => !members.some(m => m.email === f.email));

  const handleCreateGroup = async () => {
    setError('');

    // Validation
    if (groupName.trim().length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    if (groupName.length > 60) {
      setError('Group name must be at most 60 characters');
      return;
    }

    setLoading(true);

    try {
      // Create group
      const createResponse = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName.trim() }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        setError(createData.message || 'Failed to create group');
        setLoading(false);
        return;
      }

      const groupId = createData.data.id;

      // Add members to group chat
      for (const member of members) {
        try {
          await fetch(`/api/groups/${groupId}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: member.email }),
          });
        } catch (err) {
          console.error('Failed to add member:', member.email, err);
        }
      }

      // Create study room if checkbox is checked
      let studyRoomId = null;
      if (createStudyRoom) {
        try {
          const roomResponse = await fetch('/api/rooms/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: groupName.trim(),
              subject: subject.trim() || 'General',
            }),
          });

          const roomData = await roomResponse.json();

          if (roomResponse.ok && roomData.success) {
            studyRoomId = roomData.data.roomId;

            // Add group members to study room
            for (const member of members) {
              try {
                await fetch(`/api/rooms/${studyRoomId}/invite`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userEmail: member.email }),
                });
              } catch (err) {
                console.error('Failed to add member to room:', member.email, err);
              }
            }
          }
        } catch (err) {
          console.error('Failed to create study room:', err);
        }
      }

      // Add notification about successful group creation
      addNotification({
        type: 'group_invite',
        title: 'Group Created!',
        message: `Your group "${groupName.trim()}" has been created${createStudyRoom ? ' with study room' : ''}.`,
        read: false,
        metadata: {
          groupId: groupId,
          groupName: groupName.trim(),
        },
      });

      setLoading(false);
      onGroupCreated?.(groupId);
      onClose();

      // Reset form
      setGroupName('');
      setSubject('');
      setMembers([]);
      setCreateStudyRoom(true);
    } catch (err) {
      setError('Failed to create group');
      setLoading(false);
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
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Group Chat</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name (3-60 characters)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {groupName.length}/60 characters
              </p>
            </div>

            {/* Create Study Room Checkbox */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="createStudyRoom"
                checked={createStudyRoom}
                onChange={(e) => setCreateStudyRoom(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="createStudyRoom" className="flex-1 cursor-pointer">
                <p className="text-sm font-medium text-gray-900">Create Study Room</p>
                <p className="text-xs text-gray-600">
                  Automatically create a collaborative study room for this group
                </p>
              </label>
            </div>

            {/* Subject (only if creating study room) */}
            {createStudyRoom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, Science, English"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use "General"
                </p>
              </div>
            )}

            {/* Add Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Members (Optional)
              </label>

              {/* Quick Add from Friends List */}
              {availableFriends.length > 0 && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setShowFriendsDropdown(!showFriendsDropdown)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-between"
                  >
                    <span>Add from Friends List ({availableFriends.length})</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showFriendsDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFriendsDropdown && (
                    <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                      {availableFriends.map((friend) => (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => handleAddFriendFromList(friend)}
                          className="w-full px-4 py-2 hover:bg-purple-50 transition-colors text-left flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {friend.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{friend.displayName}</p>
                            <p className="text-xs text-gray-500">{friend.email}</p>
                          </div>
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Add by Email */}
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Or add by email: friend@school.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add
                </button>
              </form>
              {searchError && (
                <p className="text-xs text-red-600 mt-1">{searchError}</p>
              )}
            </div>

            {/* Members List */}
            {members.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Members ({members.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.displayName}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.email)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={loading || groupName.trim().length < 3}
                className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : createStudyRoom ? 'Create Group & Room' : 'Create Group'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
