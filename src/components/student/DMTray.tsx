'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriendsStore, useGroupsStore } from '@/lib/store';
import { openDMChannel, sendDM } from '@/lib/socket';
import { useSession } from 'next-auth/react';
import { GroupChatWindow } from '@/components/groups/GroupChatWindow';

interface DMWindowProps {
  friendId: string;
  friendName: string;
  onClose: () => void;
}

function DMWindow({ friendId, friendName, onClose }: DMWindowProps) {
  const { data: session } = useSession();
  const { dmHistory, loadDMHistory, pushDM } = useFriendsStore();
  const [messageInput, setMessageInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = dmHistory[friendId] || [];

  useEffect(() => {
    if (session?.user && friendId) {
      loadDMHistory(friendId);

      // Subscribe to real-time messages
      const cleanup = openDMChannel(session.user.id, friendId, (data: any) => {
        pushDM(data);
      });

      return cleanup;
    }
  }, [session, friendId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !session?.user) return;

    const fromUserId = session.user.id;

    // Send via API
    await fetch('/api/dm/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: friendId, message: messageInput }),
    });

    // Send via socket for real-time
    sendDM(friendId, messageInput, fromUserId);

    setMessageInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="dm-window bg-white rounded-t-2xl shadow-2xl overflow-hidden"
      style={{
        width: '320px',
        height: isMinimized ? '50px' : '400px',
        transition: 'height 0.3s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">
            {friendName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold">{friendName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '290px' }}>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8">
                No messages yet. Start the conversation!
              </div>
            )}

            {messages.map((msg, idx) => {
              const isOwn = msg.fromUserId === session?.user?.id;
              return (
                <div
                  key={idx}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
}

export function DMTray() {
  const { openDMs, friends, closeDM } = useFriendsStore();
  const { openGroups, groups, closeGroup } = useGroupsStore();

  return (
    <div className="dm-tray fixed bottom-0 right-4 z-40 flex items-end gap-4">
      <AnimatePresence>
        {/* DM Windows */}
        {openDMs.map((friendId) => {
          const friend = friends.find(f => f.id === friendId);
          if (!friend) return null;

          return (
            <DMWindow
              key={`dm-${friendId}`}
              friendId={friendId}
              friendName={friend.displayName}
              onClose={() => closeDM(friendId)}
            />
          );
        })}

        {/* Group Chat Windows */}
        {openGroups.map((groupId) => {
          const group = groups.find(g => g.id === groupId);
          if (!group) return null;

          return (
            <GroupChatWindow
              key={`group-${groupId}`}
              groupId={groupId}
              groupName={group.name}
              onClose={() => closeGroup(groupId)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
