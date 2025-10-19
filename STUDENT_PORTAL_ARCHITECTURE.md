# Student Portal V1 - Architecture & Implementation Guide

## 🎯 Overview

Complete student learning experience with:
- **Home Dashboard**: Subjects, homework, continue learning
- **Lesson Workspace**: AI tutor on interactive board with tools
- **Friends & DM**: Real-time messaging and presence
- **Study Rooms**: Collaborative boards with live cursors and group chat

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** (App Router) - Server & Client Components
- **Tailwind CSS** - Styling
- **Zustand** - Client state management
- **Framer Motion** - Animations

### Real-time & Collaboration
- **Socket.IO** - WebSocket connections for presence, DMs, room chat
- **Yjs** - CRDT for collaborative board state
- **Y-WebSocket** - Sync Yjs documents

### Drawing & Tools
- **Excalidraw** - Interactive whiteboard/blackboard
- **KaTeX** - Math rendering
- **MathLive** - Equation editor (optional)

### Storage
- **File-based JSON** (`dev_db/dev_db.json`) - Local development
- Migrates to PostgreSQL/MongoDB in production

---

## 🗄️ Database Schema Extensions

### New Collections Added

```typescript
interface Database {
  // ... existing collections
  subjects: Subject[];           // Math, Science, English
  homework: Homework[];          // Student assignments
  friendships: Friendship[];     // Student connections
  dms: DirectMessage[];          // Private messages
  studyRooms: StudyRoom[];       // Collaborative rooms
  roomMessages: RoomMessage[];   // Room chat messages
  roomSnapshots: RoomSnapshot[]; // Board state saves
  continueActivities: ContinueActivity[]; // Recent sessions
}
```

### Subject
```typescript
{
  id: 'math',
  name: 'Mathematics',
  icon: '📐',
  color: '#9333EA',
  progress: 65,
  lastAccessed: '2025-10-18T12:00:00Z'
}
```

### Homework
```typescript
{
  id: 'hw-1',
  studentUserId: 'user-123',
  subject: 'math',
  title: 'Algebra Practice Set 1',
  description: 'Complete problems 1-20',
  dueDate: '2025-10-25T23:59:59Z',
  status: 'pending', // 'done' | 'overdue'
  createdAt: '2025-10-18T10:00:00Z'
}
```

### Study Room
```typescript
{
  id: 'room-abc',
  name: 'Math Study Group',
  subject: 'math',
  ownerUserId: 'user-123',
  memberUserIds: ['user-123', 'user-456'],
  inviteCode: 'ABC123',
  createdAt: '2025-10-18T14:00:00Z'
}
```

---

## 🛣️ Route Structure

```
app/portal/student/
├── dashboard/
│   └── page.tsx                    # Home with subjects grid
├── subjects/
│   └── [subject]/
│       ├── page.tsx                # Subject landing (pick mode)
│       └── lesson/
│           └── page.tsx            # Lesson workspace
├── homework/
│   └── page.tsx                    # Homework list view
└── room/
    └── [roomId]/
        └── page.tsx                # Study room (collaborative)
```

---

## 🔌 API Routes

### Student Features
```
GET  /api/student/overview         # Home dashboard data
GET  /api/student/homework         # Homework list
GET  /api/student/continue         # Recent activities
POST /api/student/homework/update  # Mark complete
```

### Friends & Messaging
```
GET  /api/friends/list             # My friends
POST /api/friends/add              # Add friend by email
POST /api/dm/send                  # Send DM
GET  /api/dm/history               # DM thread
```

### Study Rooms
```
POST /api/rooms/create             # Create new room
POST /api/rooms/[roomId]/join      # Join room
GET  /api/rooms/[roomId]/state     # Load snapshot
POST /api/rooms/[roomId]/state     # Save snapshot
```

### AI Tutor (Stubs)
```
POST /api/tutor/answer             # Get lesson content
POST /api/ocr/explain              # Upload image for OCR
```

---

## 🧩 Component Architecture

### Home Dashboard Components

#### `components/student/HomeHeader.tsx`
```tsx
interface HomeHeaderProps {
  userName: string;
  streak: number;
  avatar?: string;
}
```
- Greeting message
- Streak counter
- Avatar/profile link

#### `components/student/SubjectsGrid.tsx`
```tsx
interface SubjectsGridProps {
  subjects: Subject[];
  onSubjectClick: (subjectId: string) => void;
}
```
- Grid of subject cards
- Progress rings
- Quick resume buttons
- Color-coded by subject

#### `components/student/HomeworkWidget.tsx`
```tsx
interface HomeworkWidgetProps {
  homework: Homework[];
  onHomeworkClick: (id: string) => void;
}
```
- Due count badge
- Sorted by due date
- Status indicators
- Quick mark done

#### `components/student/ContinueStrip.tsx`
```tsx
interface ContinueStripProps {
  activities: ContinueActivity[];
}
```
- Horizontal scrollable strip
- Recent 5 activities
- Resume icons and progress

---

### Lesson Workspace Components

#### `components/lesson/Board.tsx`
```tsx
interface BoardProps {
  theme: 'blackboard' | 'whiteboard';
  initialElements?: any[];
  onChange?: (elements: any[]) => void;
}
```
- Excalidraw wrapper
- Theme switching (dark/light)
- Export to PNG
- Zoom controls

#### `components/lesson/ToolDock.tsx`
```tsx
interface ToolDockProps {
  onUpload: (file: File) => void;
  onNote: (content: string) => void;
}
```
- Tabs: Notes, Scratchpad, Equation, Upload
- Collapsible on mobile
- Tool state persistence

#### `components/lesson/AIStreamOnBoard.tsx`
```tsx
interface AIStreamProps {
  blocks: LessonBlock[];
  boardRef: RefObject<ExcalidrawAPI>;
}

interface LessonBlock {
  type: 'text' | 'math' | 'point' | 'image';
  content?: string;
  latex?: string;
  x?: number;
  y?: number;
}
```
- Renders tutor responses on board
- KaTeX for math blocks
- Animated text placement
- Point annotations

#### `components/lesson/Checkpoint.tsx`
```tsx
interface CheckpointProps {
  questions: MCQuestion[];
  onComplete: (results: AnswerResult[]) => void;
}
```
- Multiple choice quiz overlay
- Hint ladder system
- Confetti on success
- Results breakdown

---

### Friends & DM Components

#### `components/student/FriendsBar.tsx`
```tsx
interface FriendsBarProps {
  friends: Friend[];
  onlineStatus: Record<string, boolean>;
  onDMOpen: (friendId: string) => void;
  onAddFriend: () => void;
}
```
- Horizontal friends list
- Green/gray presence dots
- Click to open DM
- "+ Add Friend" button

#### `components/student/DMTray.tsx`
```tsx
interface DMTrayProps {
  openChats: DMChat[];
  onSend: (toUserId: string, message: string) => void;
  onClose: (chatId: string) => void;
}
```
- Multiple floating chat windows
- Messenger-style UI
- Draggable/minimizable
- Unread badges
- Typing indicators

---

### Study Room Components

#### `components/rooms/RoomTopBar.tsx`
```tsx
interface RoomTopBarProps {
  room: StudyRoom;
  members: User[];
  onInvite: () => void;
  onLeave: () => void;
}
```
- Room name
- Member avatars
- Invite code/link
- Leave button

#### `components/rooms/RoomChat.tsx`
```tsx
interface RoomChatProps {
  roomId: string;
  messages: RoomMessage[];
  onSend: (message: string) => void;
}
```
- Scrollable message list
- Send input
- User avatars
- Timestamps

#### `components/rooms/CursorLayer.tsx`
```tsx
interface CursorLayerProps {
  cursors: Record<string, CursorState>;
}

interface CursorState {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
}
```
- SVG overlay
- Name tags
- Color-coded per user
- Smooth animation

---

## 🔄 State Management (Zustand)

### `lib/store.ts`

#### Student Home Store
```typescript
interface StudentHomeStore {
  subjects: Subject[];
  homework: Homework[];
  recent: ContinueActivity[];
  loading: boolean;
  loadAll: () => Promise<void>;
  markHomeworkDone: (id: string) => Promise<void>;
}

export const useStudentHomeStore = create<StudentHomeStore>((set) => ({
  subjects: [],
  homework: [],
  recent: [],
  loading: false,
  loadAll: async () => {
    set({ loading: true });
    const [subjects, homework, recent] = await Promise.all([
      fetch('/api/student/subjects').then(r => r.json()),
      fetch('/api/student/homework').then(r => r.json()),
      fetch('/api/student/continue').then(r => r.json()),
    ]);
    set({ subjects, homework, recent, loading: false });
  },
  markHomeworkDone: async (id) => {
    await fetch(`/api/student/homework/update`, {
      method: 'POST',
      body: JSON.stringify({ id, status: 'done' }),
    });
    // Update local state
  },
}));
```

#### Friends Store
```typescript
interface FriendsStore {
  friends: Friend[];
  onlineMap: Record<string, boolean>;
  openDMs: string[];
  addFriend: (email: string) => Promise<void>;
  openDM: (userId: string) => void;
  sendDM: (toUserId: string, message: string) => void;
}
```

#### Room Store
```typescript
interface RoomStore {
  currentRoom: StudyRoom | null;
  members: User[];
  cursors: Record<string, CursorState>;
  connect: (roomId: string) => void;
  sendChat: (message: string) => void;
  broadcastCursor: (x: number, y: number) => void;
}
```

---

## 🌐 Socket.IO Setup

### Server (Node Runtime)

`app/api/socket/route.ts`
```typescript
import { Server } from 'socket.io';

let io: Server;

export async function GET(req: Request) {
  if (!io) {
    io = new Server({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      // Presence
      socket.on('presence:online', (userId) => {
        socket.join(`user:${userId}`);
        io.emit('presence:update', { userId, online: true });
      });

      // DMs
      socket.on('dm:send', ({ toUserId, message }) => {
        io.to(`user:${toUserId}`).emit('dm:new', {
          from: socket.data.userId,
          message,
        });
      });

      // Rooms
      socket.on('room:join', (roomId) => {
        socket.join(`room:${roomId}`);
      });

      socket.on('room:chat', ({ roomId, message }) => {
        io.to(`room:${roomId}`).emit('room:message', {
          from: socket.data.userId,
          message,
        });
      });

      socket.on('room:cursor', ({ roomId, x, y }) => {
        socket.to(`room:${roomId}`).emit('room:cursor', {
          userId: socket.data.userId,
          x,
          y,
        });
      });
    });
  }

  return new Response('Socket.IO initialized');
}
```

### Client

`lib/socket.ts`
```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      autoConnect: false,
    });
  }
  return socket;
}
```

---

## 🎨 Board Theming

### Blackboard Theme
```css
.board-blackboard {
  background: #0b0f19;
  --color-primary: #e0e0e0;
  --color-text: #ffffff;
  font-family: 'Chalkboard', 'Comic Sans MS', cursive;
}
```

### Whiteboard Theme
```css
.board-whiteboard {
  background: #ffffff;
  --color-primary: #1a1a1a;
  --color-text: #000000;
  background-image:
    linear-gradient(#e5e5e5 1px, transparent 1px),
    linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 🚀 Implementation Priority

### Phase 1: Foundation (Day 1)
- ✅ Install dependencies
- ✅ Extend database schema
- ✅ Update types and devdb initialization
- [ ] Create Zustand stores
- [ ] Build API routes (stubs first)

### Phase 2: Home Dashboard (Day 2)
- [ ] HomeHeader component
- [ ] SubjectsGrid component
- [ ] HomeworkWidget component
- [ ] ContinueStrip component
- [ ] Wire up dashboard page

### Phase 3: Lesson Workspace (Day 3-4)
- [ ] Board component (Excalidraw wrapper)
- [ ] ToolDock component
- [ ] AIStreamOnBoard component
- [ ] Checkpoint component
- [ ] Subject landing page
- [ ] Lesson workspace page

### Phase 4: Friends & DM (Day 5)
- [ ] Friends API routes
- [ ] FriendsBar component
- [ ] DMTray component
- [ ] Socket.IO presence
- [ ] DM delivery

### Phase 5: Study Rooms (Day 6-7)
- [ ] Room API routes
- [ ] Socket.IO room events
- [ ] Yjs integration
- [ ] RoomTopBar component
- [ ] RoomChat component
- [ ] CursorLayer component
- [ ] Room page

---

## 🧪 Testing Checklist

### Home Dashboard
- [ ] Subjects load with correct progress
- [ ] Homework shows due items
- [ ] Continue strip shows recent activities
- [ ] Clicking subject navigates correctly

### Lesson Workspace
- [ ] Board loads and is drawable
- [ ] AI tutor returns lesson blocks
- [ ] Blocks render on board (text + math)
- [ ] Upload image triggers OCR
- [ ] Checkpoint quiz works
- [ ] Export PNG downloads

### Friends & DM
- [ ] Can add friend by email
- [ ] Friend shows online/offline status
- [ ] DM window opens
- [ ] Messages deliver in real-time
- [ ] Multiple DM windows work

### Study Rooms
- [ ] Create room generates invite code
- [ ] Join room via code/link
- [ ] Both users see same board
- [ ] Chat messages sync
- [ ] Cursors visible to others
- [ ] Board edits sync via Yjs

---

## 📝 API Stub Examples

### POST /api/tutor/answer
```typescript
export async function POST(req: Request) {
  const { subject, prompt, type } = await req.json();

  // Mock response with lesson blocks
  const blocks = [
    {
      type: 'text',
      content: `Let's learn about ${subject}!`,
    },
    {
      type: 'math',
      latex: '\\int_0^1 x^2 dx = \\frac{1}{3}',
    },
    {
      type: 'point',
      x: 100,
      y: 100,
      text: 'Key concept here',
    },
  ];

  return Response.json({ blocks });
}
```

### POST /api/ocr/explain
```typescript
export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get('image');

  // Mock OCR response
  const blocks = [
    {
      type: 'text',
      content: 'We detected a quadratic equation',
    },
    {
      type: 'math',
      latex: 'x^2 + 5x + 6 = 0',
    },
    {
      type: 'text',
      content: 'Solution: x = -2 or x = -3',
    },
  ];

  return Response.json({ blocks });
}
```

---

## 🔐 Security Considerations

1. **Authentication**: All `/portal/**` routes protected by middleware
2. **Authorization**: Check userId matches in API routes
3. **Validation**: Zod schemas on all inputs
4. **Rate Limiting**: Add to Socket.IO events
5. **Sanitization**: HTML/XSS prevention in chat messages

---

## 📚 Next Steps

1. Complete Zustand store implementations
2. Build all API route stubs
3. Create reusable components (start with simple ones)
4. Implement home dashboard
5. Build lesson workspace
6. Add Socket.IO for real-time features
7. Integrate Yjs for collaborative boards
8. Polish UI/UX with animations
9. Test end-to-end flows
10. Document deployment guide

---

## 💡 Production Migration Notes

When moving to production:
1. Replace `dev_db.json` with PostgreSQL
2. Deploy Socket.IO server separately (Railway/Fly.io)
3. Use Redis for Socket.IO adapter (multi-instance)
4. Deploy Yjs WebSocket server
5. Add proper authentication to WebSocket connections
6. Implement message queues for DMs
7. Add file storage for uploads (S3/Cloudinary)
8. Rate limit all endpoints
9. Add monitoring and logging
10. Implement backup strategy

---

**Status**: Database schema extended ✅
**Next**: Create Zustand stores and API routes
