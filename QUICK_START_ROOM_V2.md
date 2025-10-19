# Study Room v2 - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- All dependencies already installed
- Database has `roomPermissions` array (✅ added)
- Socket.IO server running on port 3001

### 1. Start the Application

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Ensure Socket.IO is initialized
# It starts automatically when you access any page
```

### 2. Create Test Users (if needed)

You already have test users in dev_db.json:
- `test@student.com` (Test Student) - school-1
- `ssamoraam@gmail.com` (Vuyile Sixaba) - school-1
- `testing@gmail.com` (Samora) - school-1

### 3. Test the Room

#### A. Create a Room
1. Login as any student
2. Go to dashboard
3. Create a study room (existing feature)
4. Note the room ID in URL: `/portal/student/room/room-XXXXX`

#### B. Test Join Flow
1. **Same School (Success)**:
   - Open room URL
   - Should see loading → then room with board + chat

2. **Cross School (Padlock)**:
   - Create user from different school
   - Try to join room
   - Should see 🔒 Access Restricted

3. **Invalid Room (Not Found)**:
   - Navigate to `/portal/student/room/invalid-id`
   - Should see 🔍 Room Not Found

#### C. Test Chat
1. Open room in two browser windows (different students)
2. Type message in one → appears in both instantly
3. Try sending 11 messages quickly → see rate limit toast

#### D. Test AI Permissions (Owner)
1. Login as room owner
2. Click kebab menu (⋮) in chat panel
3. Click "Disable Ask AI for all"
4. On other browser: Ask AI button should disable
5. Re-enable and verify button enables again

#### E. Test Ask AI
1. As owner or permitted member:
2. Type question in chat input
3. Click "🤖 Ask AI" button
4. Watch for:
   - System message in chat: "🤖 AI: ..."
   - AI blocks render on board as text elements
   - All members see the blocks

---

## 🔍 Debugging

### Check Logs
All room operations log to console in development:
```
[ROOM] Attempting to join room: room-XXX
[ROOM] Join successful: { roomId, userId }
[Socket.IO] Client connected: abc123
```

### Common Issues

#### 1. Padlock Shows Unexpectedly
- Check browser console for join response
- Verify both users have same schoolId
- Check API response status code

#### 2. Chat Messages Don't Appear
- Verify Socket.IO connection in Network tab
- Check socket server is running on port 3001
- Look for socket errors in console

#### 3. Ask AI Button Disabled
- Check permissions in chat panel header
- Verify you're a member or owner
- Check console for permission state

#### 4. AI Blocks Don't Render
- Check console for "AI blocks received" log
- Verify boardRef is initialized
- Check excalidrawAPI in Board component

---

## 📋 API Testing with curl

### Join Room
```bash
curl -X POST http://localhost:3000/api/rooms/room-1/join \
  -H "Content-Type: application/json" \
  --cookie "next-auth.session-token=YOUR_SESSION"
```

### Get Permissions
```bash
curl http://localhost:3000/api/rooms/room-1/permissions \
  --cookie "next-auth.session-token=YOUR_SESSION"
```

### Update Permissions (Owner)
```bash
curl -X POST http://localhost:3000/api/rooms/room-1/permissions \
  -H "Content-Type: application/json" \
  -d '{"askAiEnabled": false}' \
  --cookie "next-auth.session-token=YOUR_SESSION"
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/rooms/room-1/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from API!"}' \
  --cookie "next-auth.session-token=YOUR_SESSION"
```

### Ask AI
```bash
curl -X POST http://localhost:3000/api/rooms/room-1/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is calculus?"}' \
  --cookie "next-auth.session-token=YOUR_SESSION"
```

---

## 🎨 UI Components

### RoomLayout
Location: `/portal/student/room/[roomId]`
- Top bar with back button, room info, members, theme toggle, invite
- Grid layout: Board (left) + Chat (right 420px)
- Responsive: stacks vertically on mobile

### RoomChatPanel
- Header: Room name, member count, owner menu (⋮)
- Messages: Scrollable chat history
- Input: Text field + Send + Ask AI buttons
- Real-time updates via Socket.IO

### Board
- Excalidraw canvas
- Theme toggle: blackboard/whiteboard
- Imperative API: renderBlocks(), getScene()

---

## 🔧 Configuration

### Environment Variables
Add to `.env.local`:
```bash
# Socket.IO URL (optional, defaults to localhost:3001)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Default Permissions
When a room is created, permissions default to:
```json
{
  "askAiEnabled": true,      // All members can ask AI
  "memberAskAi": []          // Empty = all allowed when enabled
}
```

To change defaults, edit `src/lib/devdb.ts` line 383:
```typescript
permissions = {
  roomId,
  askAiEnabled: false,  // Change to false for owner-only default
  memberAskAi: [],
  updatedAt: new Date().toISOString(),
};
```

---

## 📱 Mobile Testing

### Responsive Breakpoints
- Desktop (lg): Board + Chat side-by-side
- Mobile (<lg): Board on top, Chat below (or hide one)

To test:
1. Open room on mobile device
2. Verify layout stacks vertically
3. Chat should be accessible and functional

---

## ⚡ Performance Tips

### 1. Reduce Socket Events
If experiencing lag, increase throttle intervals:
- Chat: Currently no throttle, consider adding debounce
- AI: Rate limited to 5/minute
- Board sync: Already throttled at 200ms

### 2. Message Pagination
Currently loads all messages. For large rooms, add pagination:
```typescript
// In RoomChatPanel.tsx loadMessages()
const response = await fetch(
  `/api/rooms/${roomId}/messages?limit=50&before=${oldestMessageTime}`
);
```

### 3. Board Performance
For complex boards with many AI blocks:
- Limit blocks rendered per request (e.g., 5 max)
- Add button to "clear AI blocks"
- Implement virtual scrolling for chat

---

## 🎯 Next Steps

### Immediate (Before Testing)
1. Add ToastProvider to root layout (if not already)
2. Verify socket server is running
3. Check dev_db.json has roomPermissions array

### Short Term
1. Implement permission management modal
2. Add autosave for board
3. Integrate real tutor API

### Long Term
1. Add file sharing to chat
2. Implement voice chat
3. Add screen sharing
4. Rich text AI blocks (math, code, images)

---

## 🆘 Support

### Error Codes Reference
- `ROOM_NOT_FOUND`: Room doesn't exist → Check room ID
- `CROSS_SCHOOL`: Different schools → Verify schoolId match
- `NOT_MEMBER`: User not in room → Rejoin with invite code
- `NOT_OWNER`: Non-owner tried admin action → Must be owner
- `ASK_AI_DISABLED`: AI questions disabled → Owner needs to enable
- `RATE_LIMIT`: Too many requests → Wait and retry

### Debugging Checklist
- [ ] Check browser console for errors
- [ ] Verify Socket.IO connection (Network tab)
- [ ] Check API responses in Network tab
- [ ] Look for [ROOM] logs in server console
- [ ] Verify database has roomPermissions array
- [ ] Confirm same schoolId for both users

---

**Ready to test!** Open `/portal/student/room/room-1` and start collaborating! 🚀
