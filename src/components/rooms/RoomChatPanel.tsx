'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useToast } from '@/lib/toast';

interface RoomChatPanelProps {
  roomId: string;
  room: {
    id: string;
    name: string;
    subject: string;
    ownerUserId: string;
  };
  members: Array<{
    id: string;
    displayName: string;
    role: 'owner' | 'member';
  }>;
  permissions: {
    askAiEnabled: boolean;
    memberAskAi: string[];
  };
  control: {
    controllerUserId: string | null;
  };
  me: {
    id: string;
    isOwner: boolean;
    hasControl?: boolean;
  };
  socket: any;
  onAiBlocks?: (blocks: any[]) => void;
  compact?: boolean; // New: compact mode for bottom bar
}

export function RoomChatPanel({
  roomId,
  room,
  members,
  permissions: initialPermissions,
  control,
  me,
  socket,
  onAiBlocks,
  compact = false,
}: RoomChatPanelProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [showMenu, setShowMenu] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [roomId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
    };

    const handlePermUpdate = (newPerms: any) => {
      setPermissions(newPerms);
      toast.info('Room permissions updated');
    };

    const handleAiBlocks = ({ blocks }: { blocks: any[] }) => {
      if (onAiBlocks) {
        onAiBlocks(blocks);
      }
      toast.success('AI response received');
    };

    socket.on('chat:new', handleNewMessage);
    socket.on('perm:update', handlePermUpdate);
    socket.on('ai:blocks', handleAiBlocks);

    return () => {
      socket.off('chat:new', handleNewMessage);
      socket.off('perm:update', handlePermUpdate);
      socket.off('ai:blocks', handleAiBlocks);
    };
  }, [socket, onAiBlocks]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Emit via socket for real-time delivery
        socket.emit('chat:send', { roomId, message: data.data });
      } else if (response.status === 429) {
        toast.error('Rate limit exceeded. Please slow down.');
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!input.trim() || loading) return;

    // Check permission (V3: exclusive control takes precedence)
    const canAsk = me.isOwner ||
      (control.controllerUserId === null
        ? permissions.askAiEnabled &&
          (permissions.memberAskAi.length === 0 || permissions.memberAskAi.includes(me.id))
        : control.controllerUserId === me.id);

    if (!canAsk) {
      if (control.controllerUserId !== null && control.controllerUserId !== me.id) {
        const controllerName = members.find(m => m.id === control.controllerUserId)?.displayName || 'another member';
        toast.error(`Only ${controllerName} can ask AI about the lesson right now`);
      } else {
        toast.error('You do not have permission to ask AI questions');
      }
      return;
    }

    const prompt = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/rooms/${roomId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Emit via socket for real-time delivery to all members
        socket.emit('ai:broadcast', { roomId, blocks: data.data.blocks });
      } else if (response.status === 403) {
        if (data.code === 'NO_CONTROL') {
          const controllerName = members.find(m => m.id === data.data?.controllerUserId)?.displayName || 'another member';
          toast.error(`Only ${controllerName} can ask AI about the lesson right now`);
        } else {
          toast.error(data.message || 'AI questions are disabled');
        }
      } else if (response.status === 429) {
        toast.error('Too many AI requests. Please wait.');
      } else {
        toast.error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const toggleAskAiEnabled = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ askAiEnabled: !permissions.askAiEnabled }),
      });

      const data = await response.json();

      if (data.success) {
        socket.emit('perm:broadcast', { roomId, permissions: data.data });
        setShowMenu(false);
      } else {
        toast.error(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  // V3: Check exclusive control first, then fall back to permissions
  const canAskAi = me.isOwner ||
    (control.controllerUserId === null
      ? permissions.askAiEnabled &&
        (permissions.memberAskAi.length === 0 || permissions.memberAskAi.includes(me.id))
      : control.controllerUserId === me.id);

  const getAskAiTooltip = () => {
    if (me.isOwner) return 'Ask AI about the lesson (you are the owner)';
    if (control.controllerUserId !== null) {
      if (control.controllerUserId === me.id) {
        return 'Ask AI about the lesson (you have permission)';
      } else {
        const controllerName = members.find(m => m.id === control.controllerUserId)?.displayName || 'another member';
        return `Only ${controllerName} can ask AI right now`;
      }
    }
    if (!permissions.askAiEnabled) return 'Ask AI is disabled';
    if (permissions.memberAskAi.length > 0 && !permissions.memberAskAi.includes(me.id)) {
      return 'You do not have permission to ask AI questions';
    }
    return 'Ask AI about the lesson';
  };

  // Compact mode for bottom bar (like lesson page)
  if (compact) {
    return (
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
          placeholder="Ask AI a question about the lesson..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
          disabled={loading}
        />
        <button
          onClick={handleAskAI}
          disabled={!input.trim() || loading || !canAskAi}
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={getAskAiTooltip()}
        >
          🤖 Ask AI
        </button>
      </div>
    );
  }

  // Full panel mode
  return (
    <div className="room-chat-panel h-full flex flex-col bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="font-bold text-gray-900">{room.name}</h3>
          <p className="text-xs text-gray-600">{members.length} members</p>
        </div>

        {me.isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                >
                  <button
                    onClick={toggleAskAiEnabled}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <span>{permissions.askAiEnabled ? '🔓' : '🔒'}</span>
                    <span>{permissions.askAiEnabled ? 'Disable' : 'Enable'} Ask AI for all</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPermModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <span>👥</span>
                    <span>Manage AI permissions</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg, idx) => {
          const member = members.find((m) => m.id === msg.fromUserId);
          const isOwn = msg.fromUserId === me.id;
          const isSystem = msg.fromUserId === 'system';

          if (isSystem) {
            return (
              <div key={idx} className="text-center text-sm text-gray-600 italic">
                {msg.message}
              </div>
            );
          }

          return (
            <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isOwn && (
                  <span className="text-xs text-gray-600 font-medium px-1">
                    {member?.displayName || 'Unknown'}
                  </span>
                )}
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    isOwn
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <button
          type="button"
          onClick={handleAskAI}
          disabled={!input.trim() || loading || !canAskAi}
          className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          title={getAskAiTooltip()}
        >
          <span>🤖</span>
          <span>Ask AI</span>
        </button>
      </form>
    </div>
  );
}
