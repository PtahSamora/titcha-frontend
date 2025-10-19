'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Board, BoardHandle } from '@/components/lesson/Board';
import { RoomChatPanel } from './RoomChatPanel';
import { AIStreamOnBoard } from '@/components/lesson/AIStreamOnBoard';
import { ToolDock } from '@/components/lesson/ToolDock';
import { MembersPopover } from './MembersPopover';
import { GroupChatWidget } from './GroupChatWidget';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast';
import type { LessonBlock } from '@/lib/store';

interface RoomLayoutProps {
  roomId: string;
  room: {
    id: string;
    name: string;
    subject: string;
    ownerUserId: string;
    inviteCode: string;
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
    hasControl: boolean;
  };
  socket: any;
  initialSnapshot?: any;
}

export function RoomLayout({
  roomId,
  room,
  members: initialMembers,
  permissions,
  control: initialControl,
  me: initialMe,
  socket,
  initialSnapshot,
}: RoomLayoutProps) {
  const router = useRouter();
  const toast = useToast();
  const boardRef = useRef<BoardHandle>(null);
  const [theme, setTheme] = useState<'blackboard' | 'whiteboard'>('whiteboard');
  const [aiBlocks, setAiBlocks] = useState<LessonBlock[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [controlState, setControlState] = useState(initialControl);
  const [permissionsState, setPermissionsState] = useState(permissions);
  const [members, setMembers] = useState(
    initialMembers.map((m) => ({
      ...m,
      hasControl: m.id === initialControl.controllerUserId,
      online: false,
    }))
  );
  const [me, setMe] = useState(initialMe);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/portal/student/room/join?code=${room.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard!');
  };

  const handleAiBlocks = (blocks: any[]) => {
    console.log('[Room] AI blocks received:', blocks);

    // Convert blocks to LessonBlock format for AIStreamOnBoard
    const lessonBlocks: LessonBlock[] = blocks.map((block, idx) => ({
      id: `ai-block-${Date.now()}-${idx}`,
      type: block.type || 'text',
      content: block.content || JSON.stringify(block),
      latex: block.latex,
      imageUrl: block.imageUrl,
      x: 100 + (idx % 3) * 300,
      y: 100 + Math.floor(idx / 3) * 150,
    }));

    setAiBlocks((prev) => [...prev, ...lessonBlocks]);
  };

  const handleUploadImage = async (file: File) => {
    // TODO: Implement image upload OCR functionality
    console.log('[Room] Image upload:', file.name);
    // For now, just show a placeholder message
    const block: LessonBlock = {
      id: `upload-${Date.now()}`,
      type: 'text',
      content: `Image uploaded: ${file.name} (OCR processing will be implemented)`,
      x: 100,
      y: 100 + aiBlocks.length * 150,
    };
    setAiBlocks((prev) => [...prev, block]);
  };

  const getMemberName = (userId: string) => {
    return members.find((m) => m.id === userId)?.displayName || 'Unknown';
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleControlUpdate = ({ controllerUserId }: { controllerUserId: string | null }) => {
      setControlState({ controllerUserId });
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          hasControl: m.id === controllerUserId,
        }))
      );
      setMe((prev) => ({ ...prev, hasControl: prev.id === controllerUserId }));

      toast.info(
        controllerUserId
          ? `${getMemberName(controllerUserId)} can now ask AI on the lesson`
          : 'AI permission removed - owner can ask AI again'
      );
    };

    const handlePermUpdate = (newPerms: any) => {
      setPermissionsState(newPerms);
      toast.info('AI permissions updated');
    };

    socket.on('control:update', handleControlUpdate);
    socket.on('perm:update', handlePermUpdate);
    return () => {
      socket.off('control:update', handleControlUpdate);
      socket.off('perm:update', handlePermUpdate);
    };
  }, [socket, members]);

  return (
    <div className="room-layout h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/portal/student/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">{room.name}</h1>
            <p className="text-xs text-gray-600">{room.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Members */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Members: {members.length}</span>
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                  title={member.displayName}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              ))}
              {members.length > 3 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-700 text-xs font-semibold">
                  +{members.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'blackboard' ? 'whiteboard' : 'blackboard')}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {theme === 'blackboard' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Members Button */}
          <button
            onClick={() => setShowMembers(true)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>👥</span>
            <span>Members ({members.length})</span>
          </button>

          {/* Invite */}
          <button
            onClick={handleCopyInvite}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            📋 Copy Invite
          </button>
        </div>
      </div>

      {/* Main Content: Board + ToolDock */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board Area */}
        <div className="flex-1 relative">
          <Board
            ref={boardRef}
            theme={theme}
            initialElements={initialSnapshot?.elements || []}
            editable={true}
            onReady={(api) => {
              // Force editable state after API is ready
              api.updateScene({
                appState: {
                  viewModeEnabled: false,
                  activeTool: { type: 'selection' },
                },
              });
            }}
          />

          {/* AI Content Overlay */}
          <AIStreamOnBoard blocks={aiBlocks} boardTheme={theme} />
        </div>

        {/* Tool Dock */}
        <ToolDock onUpload={handleUploadImage} />
      </div>

      {/* Bottom Chat/Question Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg px-6 py-4 z-20">
        <div className="max-w-4xl mx-auto">
          <RoomChatPanel
            roomId={roomId}
            room={room}
            members={members}
            permissions={permissionsState}
            control={controlState}
            me={me}
            socket={socket}
            onAiBlocks={handleAiBlocks}
            compact={true}
          />
        </div>
      </div>

      {/* Members Popover */}
      <AnimatePresence>
        {showMembers && (
          <MembersPopover
            roomId={roomId}
            members={members}
            control={controlState}
            permissions={permissionsState}
            me={me}
            socket={socket}
            onClose={() => setShowMembers(false)}
            onOpenGroupChat={() => {
              setShowMembers(false);
              setShowGroupChat(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Group Chat Widget */}
      <AnimatePresence>
        {showGroupChat && (
          <GroupChatWidget
            roomId={roomId}
            members={members}
            socket={socket}
            me={me}
            onClose={() => setShowGroupChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
