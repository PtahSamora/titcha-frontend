# Study Room v3 - Exclusive Ask-AI Control

## Overview
Study Room v3 introduces **exclusive Ask-AI control** where only one member at a time can press "Ask AI". The room owner can give/revoke control to specific members, ensuring orderly Q&A sessions.

**Implementation Date:** 2025-10-18
**Version:** Study Room v3.0
**Status:** ✅ Backend Complete | ⏳ Frontend In Progress

---

## ✅ Implemented Features (Backend)

### 1. Database Schema Extensions

#### RoomControl Interface
```typescript
// src/lib/types.ts
export interface RoomControl {
  roomId: string;
  controllerUserId: string | null; // null = no exclusive control
  updatedAt: string;
}

// Added to Database interface
export interface Database {
  //... existing fields
  roomControls: RoomControl[];
}
```

**Migration:** Existing databases automatically initialize `roomControls: []` on first read.

---

### 2. Database Helpers

#### File: `src/lib/devdb.ts`

**getRoomControl(roomId)**
```typescript
const control = await getRoomControl('room-1');
// Returns: { roomId, controllerUserId, updatedAt } | null
```

**ensureRoomControl(roomId)**
```typescript
const control = await ensureRoomControl('room-1');
// Creates if missing with controllerUserId: null
// Returns: { roomId, controllerUserId: null, updatedAt }
```

**setRoomControl(roomId, controllerUserId)**
```typescript
// Give control to user
await setRoomControl('room-1', 'user-123');

// Revoke control (set to null)
await setRoomControl('room-1', null);

// Returns: Updated RoomControl object
```

---

### 3. API Endpoints

#### A. GET /api/rooms/[roomId]/members

**Purpose:** Get room members list with control state

**Auth:** Requires member

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "user-123",
        "displayName": "Alice",
        "email": "alice@example.com",
        "isOwner": true,
        "hasControl": false,
        "online": false
      },
      {
        "id": "user-456",
        "displayName": "Bob",
        "email": "bob@example.com",
        "isOwner": false,
        "hasControl": true,  // Bob has exclusive control
        "online": false
      }
    ],
    "control": {
      "controllerUserId": "user-456"
    }
  }
}
```

**Error Codes:**
- `ROOM_NOT_FOUND` (404)
- `NOT_MEMBER` (403)
- `UNAUTHORIZED` (401)

---

#### B. POST /api/rooms/[roomId]/control

**Purpose:** Manage exclusive Ask-AI control (owner only)

**Auth:** Requires owner

**Request Body:**
```typescript
{
  action: 'give' | 'revoke' | 'take',
  targetUserId?: string  // Required for 'give' action
}
```

**Actions:**

1. **give** - Give control to a specific member
   ```json
   {
     "action": "give",
     "targetUserId": "user-456"
   }
   ```

2. **revoke** - Remove exclusive control (all members can ask based on old permissions)
   ```json
   {
     "action": "revoke"
   }
   ```

3. **take** - Owner takes exclusive control
   ```json
   {
     "action": "take"
   }
   ```

**Response:**
```json
{
  "success": true,
  "data": {
    "controllerUserId": "user-456",
    "action": "give"
  },
  "meta": {
    "socketEvent": "control:update",
    "socketData": {
      "roomId": "room-1",
      "controllerUserId": "user-456"
    }
  }
}
```

**Client should emit socket event:**
```typescript
socket.emit('control:broadcast', {
  roomId: 'room-1',
  controllerUserId: 'user-456'
});
```

**Error Codes:**
- `ROOM_NOT_FOUND` (404)
- `NOT_OWNER` (403) - Only owner can manage control
- `UNAUTHORIZED` (401)
- Invalid action (400)
- Target not a member (400)

---

#### C. POST /api/rooms/[roomId]/ask (Updated)

**Purpose:** Ask AI question with exclusive control enforcement

**Auth:** Requires member

**New Permission Logic:**

```typescript
if (control.controllerUserId !== null) {
  // Exclusive control mode
  if (userId !== control.controllerUserId) {
    return 403 NO_CONTROL;
  }
} else {
  // No exclusive control: use old permission system
  // (askAiEnabled, memberAskAi)
}
```

**Scenarios:**

| Control State | User | Can Ask AI? | Reason |
|---------------|------|-------------|---------|
| `null` | Owner | ✅ Yes | Owner always allowed (old system) |
| `null` | Member | ✅/❌ Depends | Based on `askAiEnabled` + `memberAskAi` |
| `user-456` | `user-456` | ✅ Yes | Has exclusive control |
| `user-456` | `user-123` | ❌ No | Someone else has control |
| `user-456` | Owner | ❌ No | Even owner blocked when control active |

**New Error Code:**
```json
{
  "success": false,
  "code": "NO_CONTROL",
  "message": "Another member currently has exclusive Ask-AI control",
  "data": {
    "controllerUserId": "user-456"
  }
}
```

**Rate Limiting:** Still enforced (5 questions / minute)

---

#### D. POST /api/rooms/[roomId]/join (Updated)

**Purpose:** Join room (returns control state)

**Response Updated:**
```json
{
  "success": true,
  "joined": true,
  "room": {...},
  "members": [...],
  "snapshot": {...},
  "permissions": {...},
  "control": {
    "controllerUserId": "user-456"  // NEW
  },
  "me": {
    "id": "user-123",
    "isOwner": false,
    "hasControl": false  // NEW
  }
}
```

---

### 4. Socket.IO Events

#### File: `src/app/api/realtime/socket/route.ts`

**New Event Handler:**

```typescript
socket.on('control:broadcast', ({ roomId, controllerUserId }) => {
  console.log('[Room] Control update:', roomId, 'controller:', controllerUserId);
  io.to(`room:${roomId}`).emit('control:update', { controllerUserId });
});
```

**Flow:**
1. Owner calls POST `/api/rooms/[roomId]/control`
2. API returns success with `meta.socketEvent` and `meta.socketData`
3. Client emits `control:broadcast` with data
4. Socket server broadcasts `control:update` to all room members
5. All clients update UI to reflect new controller

---

## ⏳ Frontend Components (To Implement)

### 1. Members Popover Component

**File:** `src/components/rooms/MembersPopover.tsx` (to create)

**Features:**
- List all room members
- Show online status (future)
- Highlight current controller
- Owner controls:
  - "Give Control" button per member
  - "Revoke Control" button (global)
  - "Take Control" button (for owner)

**Props:**
```typescript
interface MembersPopoverProps {
  roomId: string;
  members: Array<{
    id: string;
    displayName: string;
    isOwner: boolean;
    hasControl: boolean;
    online: boolean;
  }>;
  control: {
    controllerUserId: string | null;
  };
  me: {
    id: string;
    isOwner: boolean;
  };
  socket: any;
}
```

**UI Structure:**
```
┌─────────────────────────────┐
│ Members (3)                 │
├─────────────────────────────┤
│ 👑 Alice (Owner)            │
│    [Take Control]           │
├─────────────────────────────┤
│ ✨ Bob (Has Control)        │
│    [Revoke Control]         │
├─────────────────────────────┤
│ 👤 Charlie                  │
│    [Give Control]           │
└─────────────────────────────┘
```

**Actions:**
```typescript
async function giveControl(targetUserId: string) {
  const res = await fetch(`/api/rooms/${roomId}/control`, {
    method: 'POST',
    body: JSON.stringify({ action: 'give', targetUserId }),
  });

  if (res.ok) {
    const data = await res.json();
    socket.emit('control:broadcast', data.meta.socketData);
  }
}

async function revokeControl() {
  const res = await fetch(`/api/rooms/${roomId}/control`, {
    method: 'POST',
    body: JSON.stringify({ action: 'revoke' }),
  });

  if (res.ok) {
    const data = await res.json();
    socket.emit('control:broadcast', data.meta.socketData);
  }
}

async function takeControl() {
  const res = await fetch(`/api/rooms/${roomId}/control`, {
    method: 'POST',
    body: JSON.stringify({ action: 'take' }),
  });

  if (res.ok) {
    const data = await res.json();
    socket.emit('control:broadcast', data.meta.socketData);
  }
}
```

---

### 2. Group Chat Widget Component

**File:** `src/components/rooms/GroupChatWidget.tsx` (to create)

**Features:**
- Sizeable/resizable chat window
- Shows all room members in chat
- Real-time messages via Socket.IO
- Separate from bottom Ask-AI bar
- Can be opened from Members popover

**Props:**
```typescript
interface GroupChatWidgetProps {
  roomId: string;
  members: Array<{ id: string; displayName: string }>;
  socket: any;
  onClose: () => void;
}
```

**UI Structure:**
```
┌──────────────────────────────┐
│ Room Chat         [X Close]  │
├──────────────────────────────┤
│ Messages...                  │
│ Alice: Hey everyone!         │
│ Bob: What's up?              │
│                              │
├──────────────────────────────┤
│ [Type message...] [Send]     │
└──────────────────────────────┘
```

**Features:**
- Uses existing `/api/rooms/[roomId]/messages` API
- Listens to `chat:new` socket event
- Separate from Ask-AI functionality
- Can coexist with bottom bar

---

### 3. Update RoomLayout Component

**File:** `src/components/rooms/RoomLayout.tsx` (to update)

**Changes Needed:**

**A. Add Members Button**
```typescript
<button onClick={() => setShowMembers(true)}>
  👥 Members ({members.length})
</button>
```

**B. Add State for Popovers**
```typescript
const [showMembers, setShowMembers] = useState(false);
const [showGroupChat, setShowGroupChat] = useState(false);
const [controlState, setControlState] = useState({
  controllerUserId: initialControl.controllerUserId,
});
```

**C. Socket Listener for Control Updates**
```typescript
useEffect(() => {
  if (!socket) return;

  const handleControlUpdate = ({ controllerUserId }: { controllerUserId: string | null }) => {
    setControlState({ controllerUserId });
    toast.info(
      controllerUserId
        ? `${getMemberName(controllerUserId)} now has Ask-AI control`
        : 'Ask-AI control revoked - all members can ask'
    );
  };

  socket.on('control:update', handleControlUpdate);
  return () => socket.off('control:update', handleControlUpdate);
}, [socket]);
```

**D. Update Ask-AI Button Logic**
```typescript
const canAskAi = controlState.controllerUserId === null
  ? (me.isOwner || (permissions.askAiEnabled && ...))  // Old logic
  : me.id === controlState.controllerUserId;  // Exclusive control

const askAiButtonTooltip = !canAskAi
  ? controlState.controllerUserId
    ? `${getMemberName(controlState.controllerUserId)} has exclusive control`
    : 'You do not have permission'
  : 'Ask AI a question';
```

**E. Render Popovers**
```typescript
{showMembers && (
  <MembersPopover
    roomId={roomId}
    members={members}
    control={controlState}
    me={me}
    socket={socket}
    onClose={() => setShowMembers(false)}
    onOpenGroupChat={() => {
      setShowMembers(false);
      setShowGroupChat(true);
    }}
  />
)}

{showGroupChat && (
  <GroupChatWidget
    roomId={roomId}
    members={members}
    socket={socket}
    onClose={() => setShowGroupChat(false)}
  />
)}
```

---

### 4. Update RoomChatPanel (Compact Mode)

**File:** `src/components/rooms/RoomChatPanel.tsx` (already exists)

**Update Ask-AI Button:**
```typescript
// Pass control state as prop
interface RoomChatPanelProps {
  // ... existing props
  control: {
    controllerUserId: string | null;
  };
}

// Update canAskAi logic
const canAskAi = control.controllerUserId === null
  ? (me.isOwner || (permissions.askAiEnabled && ...))  // Old logic
  : me.id === control.controllerUserId;  // Exclusive control

// Update button tooltip
const buttonTitle = !canAskAi
  ? control.controllerUserId
    ? `Another member has exclusive Ask-AI control`
    : 'You do not have permission'
  : 'Ask AI a question';
```

---

## 🔄 Control Flow Examples

### Example 1: Owner Gives Control to Bob

**1. Owner clicks "Give Control" on Bob in Members popover**

**2. API Call:**
```typescript
POST /api/rooms/room-1/control
Body: { action: 'give', targetUserId: 'bob-123' }
```

**3. Server Response:**
```json
{
  "success": true,
  "data": { "controllerUserId": "bob-123", "action": "give" },
  "meta": {
    "socketEvent": "control:broadcast",
    "socketData": {
      "roomId": "room-1",
      "controllerUserId": "bob-123"
    }
  }
}
```

**4. Client Emits Socket:**
```typescript
socket.emit('control:broadcast', {
  roomId: 'room-1',
  controllerUserId: 'bob-123'
});
```

**5. All Clients Receive:**
```typescript
socket.on('control:update', ({ controllerUserId }) => {
  // Update UI: Bob's Ask-AI button enabled, others disabled
  setControlState({ controllerUserId: 'bob-123' });
  toast.info('Bob now has Ask-AI control');
});
```

**6. UI Updates:**
- Bob's Ask-AI button: ✅ Enabled
- Alice's Ask-AI button: ❌ Disabled (tooltip: "Bob has exclusive control")
- Charlie's Ask-AI button: ❌ Disabled (tooltip: "Bob has exclusive control")

---

### Example 2: Owner Revokes Control

**1. Owner clicks "Revoke Control" in Members popover**

**2. API Call:**
```typescript
POST /api/rooms/room-1/control
Body: { action: 'revoke' }
```

**3. Server updates control to `null`**

**4. Socket broadcast:**
```typescript
socket.emit('control:broadcast', {
  roomId: 'room-1',
  controllerUserId: null
});
```

**5. All clients receive:**
```typescript
socket.on('control:update', ({ controllerUserId }) => {
  setControlState({ controllerUserId: null });
  toast.info('Ask-AI control revoked - all members can ask');
});
```

**6. UI reverts to old permission system:**
- Members with `askAiEnabled`: ✅ Can ask
- Members without permission: ❌ Still disabled

---

### Example 3: Bob Tries to Ask AI (Has Control)

**1. Bob types question and clicks "Ask AI"**

**2. API Call:**
```typescript
POST /api/rooms/room-1/ask
Body: { prompt: 'What is calculus?' }
```

**3. Server checks control:**
```typescript
const control = await ensureRoomControl('room-1');
// control.controllerUserId === 'bob-123'
// Bob's userId === 'bob-123'
// ✅ Allowed
```

**4. AI processes and returns blocks**

**5. Socket broadcasts AI response to all members**

---

### Example 4: Alice Tries to Ask AI (No Control)

**1. Alice types question and clicks "Ask AI"**

**2. API Call:**
```typescript
POST /api/rooms/room-1/ask
Body: { prompt: 'Explain derivatives' }
```

**3. Server checks control:**
```typescript
const control = await ensureRoomControl('room-1');
// control.controllerUserId === 'bob-123'
// Alice's userId === 'alice-789'
// ❌ Not allowed
```

**4. Server returns 403:**
```json
{
  "success": false,
  "code": "NO_CONTROL",
  "message": "Another member currently has exclusive Ask-AI control",
  "data": { "controllerUserId": "bob-123" }
}
```

**5. Client shows toast:**
```typescript
toast.error('Bob has exclusive Ask-AI control');
```

---

## 📊 State Management

### Room State Object

```typescript
interface RoomState {
  roomId: string;
  room: {...};
  members: Array<{
    id: string;
    displayName: string;
    isOwner: boolean;
    hasControl: boolean;
    online: boolean;
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
}
```

### State Updates

**On Join:**
```typescript
const joinResponse = await fetch(`/api/rooms/${roomId}/join`);
const data = await joinResponse.json();

setRoomState({
  ...data,
  control: data.control,
  me: { ...data.me, hasControl: data.me.hasControl },
});
```

**On Control Update (Socket):**
```typescript
socket.on('control:update', ({ controllerUserId }) => {
  setRoomState((prev) => ({
    ...prev,
    control: { controllerUserId },
    me: {
      ...prev.me,
      hasControl: prev.me.id === controllerUserId,
    },
    members: prev.members.map((m) => ({
      ...m,
      hasControl: m.id === controllerUserId,
    })),
  }));
});
```

---

## 🧪 Testing Guide

### Test 1: Give Control Flow
1. Login as owner
2. Join room with another user (Bob)
3. Owner clicks "Members" button
4. Members popover opens
5. Owner clicks "Give Control" on Bob
6. **Expected:**
   - API call succeeds
   - Socket event broadcast
   - Bob's Ask-AI button enables
   - Owner's Ask-AI button disables
   - Toast shows: "Bob now has Ask-AI control"

### Test 2: Revoke Control
1. Bob has control (from Test 1)
2. Owner clicks "Revoke Control"
3. **Expected:**
   - Control set to null
   - All members revert to old permission system
   - Bob can still ask if `askAiEnabled=true`
   - Toast shows: "Ask-AI control revoked"

### Test 3: Exclusive Control Enforcement
1. Give control to Bob
2. Alice tries to click "Ask AI"
3. **Expected:**
   - Button is disabled
   - Tooltip shows: "Bob has exclusive Ask-AI control"
   - If clicked anyway (somehow), API returns 403 NO_CONTROL

### Test 4: Owner Takes Control
1. Bob has control
2. Owner clicks "Take Control"
3. **Expected:**
   - Owner gets control
   - Bob's button disables
   - Owner's button enables
   - Toast shows: "You now have Ask-AI control"

### Test 5: Control Persists Across Sessions
1. Give control to Bob
2. Bob refreshes page
3. **Expected:**
   - Join API returns `hasControl: true` for Bob
   - Bob's Ask-AI button is enabled on load

### Test 6: Multi-User Real-Time Sync
1. Open room in 3 browsers (Owner, Bob, Charlie)
2. Owner gives control to Bob
3. **Expected:**
   - All 3 browsers update instantly via socket
   - Only Bob can ask AI
   - Owner and Charlie see Bob has control

---

## 🚀 Next Steps

### Priority 1: Frontend Components
1. **Create MembersPopover component**
   - Members list with roles
   - Control buttons (Give/Revoke/Take)
   - Online status indicators

2. **Create GroupChatWidget component**
   - Resizable chat window
   - Real-time messaging
   - Member list sidebar

3. **Update RoomLayout**
   - Add Members button
   - Integrate popovers
   - Add socket listeners

4. **Update RoomChatPanel**
   - Pass control prop
   - Update Ask-AI button logic
   - Update tooltips

### Priority 2: Polish & UX
1. Visual indicators for controller
   - Crown/star icon next to controller's name
   - Different button colors
   - Animated transitions

2. Toast notifications
   - Control given: "Bob now has control"
   - Control revoked: "Everyone can ask AI"
   - Control denied: "Alice has control - please wait"

3. Online presence
   - Green dot for online members
   - Gray dot for offline
   - "Last seen" timestamps

### Priority 3: Advanced Features
1. **Control Queue System**
   - Members can "request control"
   - Owner approves/denies
   - Auto-queue with timeout

2. **Time-Limited Control**
   - Owner sets duration (e.g., 5 minutes)
   - Auto-revoke after timeout
   - Warning before expiration

3. **Control History**
   - Log who had control when
   - Display in Members popover
   - Export as CSV

---

## 📝 Migration Notes

### For Existing Rooms

All existing rooms will have `controllerUserId: null` by default:
- No exclusive control active
- Old permission system (`askAiEnabled`, `memberAskAi`) still works
- Owner can activate exclusive control anytime

### Backward Compatibility

The system is fully backward compatible:
- If `controllerUserId === null` → use old permissions
- If `controllerUserId !== null` → exclusive control mode
- Both modes coexist seamlessly

### Database Migration

Run this to initialize roomControls for existing databases:
```typescript
// Automatic on first read via readDB()
if (!db.roomControls) {
  db.roomControls = [];
}
```

---

## 📊 API Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/rooms/[id]/members` | GET | Member | Get members + control state |
| `/api/rooms/[id]/control` | POST | Owner | Give/revoke/take control |
| `/api/rooms/[id]/ask` | POST | Member* | Ask AI (enforces control) |
| `/api/rooms/[id]/join` | POST | User | Join room (returns control) |

*Member with control or permission

## 🔌 Socket Events

| Event | Direction | Data | Purpose |
|-------|-----------|------|---------|
| `control:broadcast` | Client → Server | `{roomId, controllerUserId}` | Request broadcast |
| `control:update` | Server → Clients | `{controllerUserId}` | Notify control change |

---

**Implementation Status:**
- ✅ Database schema
- ✅ API endpoints
- ✅ Socket.IO handlers
- ⏳ Frontend components (TODO)
- ⏳ Testing (TODO)

**Ready for frontend development!**
