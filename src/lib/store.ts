import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'school' | 'admin';
  avatar?: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      clearNotifications: () => set({ notifications: [] }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'titcha-storage',
    }
  )
);

// Lesson Block Types
export interface LessonBlock {
  id: string;
  type: 'text' | 'math' | 'point' | 'image' | 'diagram';
  content?: string;
  latex?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  imageUrl?: string;
}

export interface MCQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CheckpointResult {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

// Lesson State Store
interface LessonStore {
  subject: string;
  topic: string;
  boardTheme: 'blackboard' | 'whiteboard';
  blocks: LessonBlock[];
  checkpoint: MCQuestion[] | null;
  checkpointResults: CheckpointResult[];
  loading: boolean;
  error: string | null;

  // Actions
  setSubject: (subject: string) => void;
  setTopic: (topic: string) => void;
  toggleTheme: () => void;
  addBlocks: (blocks: LessonBlock[]) => void;
  clearBlocks: () => void;
  startLesson: (subject: string, topic: string) => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  loadCheckpoint: (topic: string) => Promise<void>;
  submitCheckpoint: (results: CheckpointResult[]) => void;
  explainImage: (imageFile: File) => Promise<void>;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  subject: '',
  topic: '',
  boardTheme: 'whiteboard',
  blocks: [],
  checkpoint: null,
  checkpointResults: [],
  loading: false,
  error: null,

  setSubject: (subject) => set({ subject }),
  setTopic: (topic) => set({ topic }),

  toggleTheme: () => set((state) => ({
    boardTheme: state.boardTheme === 'blackboard' ? 'whiteboard' : 'blackboard'
  })),

  addBlocks: (blocks) => set((state) => ({
    blocks: [...state.blocks, ...blocks]
  })),

  clearBlocks: () => set({ blocks: [], checkpoint: null, checkpointResults: [] }),

  startLesson: async (subject, topic) => {
    set({ loading: true, error: null, subject, topic, blocks: [] });

    try {
      const response = await fetch('/api/tutor/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          prompt: `Start a lesson on ${topic} for Grade 10`,
          type: 'lesson'
        }),
      });

      if (!response.ok) throw new Error('Failed to start lesson');

      const data = await response.json();

      set({
        blocks: data.blocks.map((block: any, index: number) => ({
          ...block,
          id: `block-${Date.now()}-${index}`
        })),
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start lesson',
        loading: false
      });
    }
  },

  askQuestion: async (question) => {
    set({ loading: true, error: null });

    try {
      const { subject, topic } = get();
      const response = await fetch('/api/tutor/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          prompt: question,
          type: 'question'
        }),
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();

      const newBlocks = data.blocks.map((block: any, index: number) => ({
        ...block,
        id: `block-${Date.now()}-${index}`
      }));

      set((state) => ({
        blocks: [...state.blocks, ...newBlocks],
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get answer',
        loading: false
      });
    }
  },

  loadCheckpoint: async (topic) => {
    set({ loading: true, error: null });

    try {
      const { subject } = get();
      const response = await fetch('/api/tutor/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          type: 'checkpoint'
        }),
      });

      if (!response.ok) throw new Error('Failed to load checkpoint');

      const data = await response.json();

      set({
        checkpoint: data.questions,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load checkpoint',
        loading: false
      });
    }
  },

  submitCheckpoint: (results) => {
    set({ checkpointResults: results, checkpoint: null });
  },

  explainImage: async (imageFile) => {
    set({ loading: true, error: null });

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/ocr/explain', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process image');

      const data = await response.json();

      const newBlocks = data.blocks.map((block: any, index: number) => ({
        ...block,
        id: `block-${Date.now()}-${index}`
      }));

      set((state) => ({
        blocks: [...state.blocks, ...newBlocks],
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to process image',
        loading: false
      });
    }
  },
}));

// Notes Store
interface NotesStore {
  notes: string;
  setNotes: (notes: string) => void;
  saveNotes: () => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: '',

  setNotes: (notes) => set({ notes }),

  saveNotes: async () => {
    const { notes } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem('lesson-notes', notes);
    }
  },
}));

// Friends Store
interface Friend {
  id: string;
  email: string;
  displayName: string;
  role: string;
  online?: boolean;
}

interface DMMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: string;
}

interface FriendsStore {
  friends: Friend[];
  onlineMap: Record<string, boolean>;
  openDMs: string[];
  dmHistory: Record<string, DMMessage[]>;
  loading: boolean;

  loadFriends: () => Promise<void>;
  addFriend: (email: string) => Promise<void>;
  setOnlineStatus: (userId: string, online: boolean) => void;
  openDM: (friendId: string) => void;
  closeDM: (friendId: string) => void;
  loadDMHistory: (friendId: string) => Promise<void>;
  pushDM: (msg: DMMessage) => void;
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  onlineMap: {},
  openDMs: [],
  dmHistory: {},
  loading: false,

  loadFriends: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/friends/list');
      const data = await response.json();
      set({ friends: data.friends || [], loading: false });
    } catch (error) {
      console.error('Failed to load friends:', error);
      set({ loading: false });
    }
  },

  addFriend: async (email: string) => {
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendEmail: email }),
      });
      const data = await response.json();
      if (response.ok) {
        get().loadFriends();
      }
      return data;
    } catch (error) {
      console.error('Failed to add friend:', error);
      throw error;
    }
  },

  setOnlineStatus: (userId: string, online: boolean) => {
    set((state) => ({
      onlineMap: { ...state.onlineMap, [userId]: online },
    }));
  },

  openDM: (friendId: string) => {
    set((state) => ({
      openDMs: state.openDMs.includes(friendId) ? state.openDMs : [...state.openDMs, friendId],
    }));
  },

  closeDM: (friendId: string) => {
    set((state) => ({
      openDMs: state.openDMs.filter(id => id !== friendId),
    }));
  },

  loadDMHistory: async (friendId: string) => {
    try {
      const response = await fetch(`/api/dm/history?friendId=${friendId}`);
      const data = await response.json();
      set((state) => ({
        dmHistory: { ...state.dmHistory, [friendId]: data.messages || [] },
      }));
    } catch (error) {
      console.error('Failed to load DM history:', error);
    }
  },

  pushDM: (msg: DMMessage) => {
    set((state) => {
      const otherUserId = msg.fromUserId === msg.toUserId ? msg.toUserId :
        (state.friends.find(f => f.id === msg.fromUserId)?.id || msg.fromUserId);
      const currentHistory = state.dmHistory[otherUserId] || [];
      return {
        dmHistory: {
          ...state.dmHistory,
          [otherUserId]: [...currentHistory, msg],
        },
      };
    });
  },
}));

// Room Store
interface RoomMember {
  id: string;
  displayName: string;
  email: string;
}

interface RoomCursor {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
}

interface RoomStore {
  currentRoomId: string | null;
  members: RoomMember[];
  chat: any[];
  cursors: Record<string, RoomCursor>;
  loading: boolean;

  connect: (roomId: string) => Promise<void>;
  disconnect: () => void;
  sendChat: (message: string) => void;
  addChatMessage: (msg: any) => void;
  updateCursor: (userId: string, cursor: RoomCursor) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  currentRoomId: null,
  members: [],
  chat: [],
  cursors: {},
  loading: false,

  connect: async (roomId: string) => {
    set({ loading: true, currentRoomId: roomId });
    try {
      // Load room data
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });
      const data = await response.json();
      set({
        members: data.members || [],
        chat: data.messages || [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to connect to room:', error);
      set({ loading: false });
    }
  },

  disconnect: () => {
    set({
      currentRoomId: null,
      members: [],
      chat: [],
      cursors: {},
    });
  },

  sendChat: (message: string) => {
    const { currentRoomId } = get();
    if (!currentRoomId) return;
    // Socket emission will be handled in the component
  },

  addChatMessage: (msg: any) => {
    set((state) => ({
      chat: [...state.chat, msg],
    }));
  },

  updateCursor: (userId: string, cursor: RoomCursor) => {
    set((state) => ({
      cursors: { ...state.cursors, [userId]: cursor },
    }));
  },
}));

// Groups Store
interface GroupChat {
  id: string;
  name: string;
  ownerUserId: string;
  memberUserIds: string[];
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupMessage {
  id: string;
  groupId: string;
  fromUserId: string;
  message: string;
  createdAt: string;
}

interface GroupsStore {
  groups: GroupChat[];
  openGroups: string[];
  groupMessages: Record<string, GroupMessage[]>;
  loading: boolean;

  loadGroups: () => Promise<void>;
  openGroup: (groupId: string) => void;
  closeGroup: (groupId: string) => void;
  loadGroupMessages: (groupId: string) => Promise<void>;
  pushGroupMessage: (msg: GroupMessage) => void;
}

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  groups: [],
  openGroups: [],
  groupMessages: {},
  loading: false,

  loadGroups: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/groups/list');
      const data = await response.json();
      if (data.success) {
        set({ groups: data.data || [], loading: false });
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
      set({ loading: false });
    }
  },

  openGroup: (groupId: string) => {
    set((state) => ({
      openGroups: state.openGroups.includes(groupId)
        ? state.openGroups
        : [...state.openGroups, groupId],
    }));
  },

  closeGroup: (groupId: string) => {
    set((state) => ({
      openGroups: state.openGroups.filter(id => id !== groupId),
    }));
  },

  loadGroupMessages: async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages?limit=50`);
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          groupMessages: { ...state.groupMessages, [groupId]: data.data || [] },
        }));
      }
    } catch (error) {
      console.error('Failed to load group messages:', error);
    }
  },

  pushGroupMessage: (msg: GroupMessage) => {
    set((state) => {
      const currentHistory = state.groupMessages[msg.groupId] || [];
      return {
        groupMessages: {
          ...state.groupMessages,
          [msg.groupId]: [...currentHistory, msg],
        },
      };
    });
  },
}));
