# Troubleshooting Guide

## Common Issues and Solutions

### 1. Socket.IO Connection Failed (ERR_CONNECTION_REFUSED)

**Symptoms:**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
http://localhost:3001/api/realtime/socket/...
```

**Cause:**
The Socket.IO server hasn't been initialized yet. It starts on-demand when the route is first accessed.

**Solution:**
Trigger the Socket.IO initialization by making a request to the endpoint:

```bash
curl http://localhost:3000/api/realtime/socket
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Socket.IO server initialized",
  "connections": 0
}
```

**Automatic Fix:**
The socket server will auto-initialize when any page that uses Socket.IO loads. Simply refresh the page after seeing the error once.

**Verification:**
Check browser console for:
```
[Socket.IO] Server listening on port 3001
```

---

### 2. React Controlled Input Warning from Excalidraw

**Symptoms:**
```
Warning: A component is changing a controlled input to be uncontrolled.
    at input
    at label
    at LockButton
```

**Cause:**
Excalidraw's internal LockButton component receives undefined values for some appState properties during initialization.

**Solution:**
Already fixed in `src/components/lesson/Board.tsx` by ensuring all required appState values are explicitly defined:

```typescript
appState: {
  viewBackgroundColor: themeStyles[theme].canvasBackground,
  gridSize: 20,
  activeTool: { type: 'selection' },
  viewModeEnabled: !isEditable,
  zenModeEnabled: false,        // Added
  gridModeEnabled: true,         // Added
}
```

**Note:**
This warning is from Excalidraw's internal components and doesn't affect functionality. The fix prevents it from appearing.

---

### 3. Board Still Locked After Join

**Symptoms:**
- Board shows padlock icon
- Can't draw or select elements
- Only hand tool works

**Debugging Steps:**

**Step 1: Check Editable Prop**
Open React DevTools → Find Board component → Check props:
```javascript
editable: true  // Should be true
```

**Step 2: Check View Mode State**
Open browser console and run:
```javascript
// Access via React DevTools or window global
boardRef.current.getScene().appState.viewModeEnabled
// Should return: false
```

**Step 3: Manual Toggle**
Press "V" key on keyboard (development mode only)
- Should toggle between locked/editable
- Check console for: `[Board] View mode toggled: EDITABLE`

**Step 4: Force Editable**
Run in console:
```javascript
boardRef.current.setEditable(true);
```

**Solutions:**

**If editable prop is false:**
Update RoomLayout to pass `editable={true}`:
```typescript
<Board
  ref={boardRef}
  editable={true}  // Must be true
  onReady={(api) => {
    api.updateScene({
      appState: {
        viewModeEnabled: false,
        activeTool: { type: 'selection' },
      },
    });
  }}
/>
```

**If onReady not firing:**
Check Board component has the callback:
```typescript
const handleExcalidrawAPI = (api: any) => {
  apiRef.current = api;
  setTimeout(() => {
    if (api && isEditable) {
      api.updateScene({
        appState: {
          viewModeEnabled: false,
          activeTool: { type: 'selection' },
        },
      });
    }
  }, 100);
  if (onReady) onReady(api);  // Must call this
};
```

---

### 4. Chat Messages Not Appearing

**Symptoms:**
- Type message and click Send
- Message doesn't appear in chat
- No errors in console

**Debugging Steps:**

**Step 1: Check Socket Connection**
Browser DevTools → Network tab → Filter: WS
- Should see WebSocket connection to `localhost:3001`
- Status should be "101 Switching Protocols" (green)

**Step 2: Check Room Join**
Console should show:
```
[ROOM] Join successful, initializing socket
[Room] Join: room-1 by <userId>
```

**Step 3: Check Message Send**
When clicking Send, console should show:
```
[Room] Chat send: room-1 msg-<timestamp>
```

**Solutions:**

**If socket not connected:**
1. Initialize Socket.IO server (see Issue #1)
2. Refresh the page
3. Check port 3001 is not blocked by firewall

**If room join failed:**
Check join response in Network tab:
- Look for `/api/rooms/[roomId]/join` request
- Should return `{ success: true, joined: true }`
- If error code returned, see error handling below

**If message send fails:**
Check rate limiting:
- Limit: 10 messages per 10 seconds
- Wait 10 seconds and try again
- Console will show: "Rate limit exceeded"

---

### 5. AI Blocks Not Rendering on Board

**Symptoms:**
- Click "Ask AI" button
- System message appears in chat
- But no blocks render on board

**Debugging Steps:**

**Step 1: Check Board Ref**
Console:
```javascript
boardRef.current
// Should return: { renderBlocks: f, setEditable: f, getScene: f }
```

**Step 2: Check AI Response**
Console should show:
```
[Room] AI blocks received: [...]
```

**Step 3: Check Socket Event**
Network tab → WS → Messages → Look for:
```json
{
  "type": "ai:blocks",
  "data": {
    "roomId": "room-1",
    "blocks": [...]
  }
}
```

**Solutions:**

**If boardRef is null:**
Board component not mounted yet. Wait for room to fully load.

**If renderBlocks doesn't exist:**
Board component not using forwardRef properly. Check Board.tsx implementation.

**If blocks received but not rendering:**
Check handleAiBlocks in RoomLayout:
```typescript
const handleAiBlocks = (blocks: any[]) => {
  console.log('[Room] AI blocks received:', blocks);
  if (boardRef.current?.renderBlocks) {
    boardRef.current.renderBlocks(blocks);
  }
};
```

**If socket event not received:**
Check Socket.IO server has the event handler:
```typescript
socket.on('ai:broadcast', ({ roomId, blocks }) => {
  io.to(`room:${roomId}`).emit('ai:blocks', { roomId, blocks });
});
```

---

### 6. Cross-School Join Errors

**Symptoms:**
- Navigate to room URL
- See padlock with "Access Restricted"
- Error code: CROSS_SCHOOL

**Cause:**
User's schoolId doesn't match room owner's schoolId.

**Verification:**
Check dev_db.json:
```json
// User
{
  "id": "user-123",
  "schoolId": "school-1"  // Must match
}

// Room owner
{
  "id": "owner-456",
  "schoolId": "school-1"  // Must match
}
```

**Solution:**
Either:
1. Create user with same schoolId as room owner
2. Join a different room from your school
3. Create a new room (you'll be the owner)

**Test Users:**
All test users are from `school-1`:
- test@student.com (Test Student)
- ssamoraam@gmail.com (Vuyile Sixaba)
- testing@gmail.com (Samora)

---

### 7. Room Not Found Error

**Symptoms:**
- Navigate to room URL
- See "Room Not Found" with search icon
- Error code: ROOM_NOT_FOUND

**Cause:**
Room doesn't exist in database.

**Verification:**
Check dev_db.json for studyRooms:
```json
{
  "studyRooms": [
    {
      "id": "room-1",
      "name": "Math Study Group",
      ...
    }
  ]
}
```

**Solution:**
1. Use existing room ID: `room-1`
2. Create a new room via dashboard
3. Use invite code to join existing room

---

### 8. ToastProvider Error

**Symptoms:**
```
Error: useToast must be used within a ToastProvider
```

**Cause:**
ToastProvider not in component tree.

**Solution:**
Already fixed in `src/components/Providers.tsx`:
```typescript
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
```

**Verification:**
Check root layout wraps app with `<Providers>`:
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## Development Tools

### Keyboard Shortcuts (Development Only)

**V Key - Toggle View Mode**
- Press "V" to lock/unlock board
- Console logs: `[Board] View mode toggled: LOCKED/EDITABLE`
- Only works when `NODE_ENV !== 'production'`

### Console Debugging

**Check Join State:**
```javascript
// After joining room, inspect state
console.log('Room joined:', joinState);
```

**Check Board API:**
```javascript
// Access board methods
boardRef.current.getScene();
boardRef.current.setEditable(true);
boardRef.current.renderBlocks([{ content: 'Test' }]);
```

**Check Socket Connection:**
```javascript
// Check socket instance
console.log('Socket:', socket);
console.log('Connected:', socket.connected);
```

### Network Tab Debugging

**Check API Calls:**
1. Open DevTools → Network tab
2. Filter: Fetch/XHR
3. Look for:
   - `/api/rooms/[roomId]/join` - Join status
   - `/api/rooms/[roomId]/messages` - Chat messages
   - `/api/rooms/[roomId]/ask` - AI requests
   - `/api/rooms/[roomId]/permissions` - Permission updates

**Check WebSocket:**
1. Network tab → WS filter
2. Should see: `localhost:3001`
3. Click to view messages
4. Look for: `room:join`, `chat:new`, `ai:blocks`, `perm:update`

---

## Error Code Reference

| Code | Status | Meaning | Solution |
|------|--------|---------|----------|
| `ROOM_NOT_FOUND` | 404 | Room doesn't exist | Check room ID, create new room |
| `CROSS_SCHOOL` | 403 | Different schools | Join room from your school |
| `OWNER_NOT_FOUND` | 500 | Room owner missing | Database corruption, contact admin |
| `UNAUTHORIZED` | 401 | Not logged in | Login first |
| `NOT_MEMBER` | 403 | Not room member | Use invite code to join |
| `NOT_OWNER` | 403 | Not room owner | Only owner can perform action |
| `ASK_AI_DISABLED` | 403 | AI disabled | Owner needs to enable |
| `RATE_LIMIT` | 429 | Too many requests | Wait and retry |

---

## Quick Fixes Summary

### Socket won't connect
```bash
curl http://localhost:3000/api/realtime/socket
```

### Board locked after join
```javascript
// Console
boardRef.current.setEditable(true);
```
Or press **V** key (dev mode)

### Messages not sending
- Wait 10 seconds (rate limit)
- Check socket connection (Network → WS)
- Reinitialize socket server

### AI blocks not rendering
```javascript
// Console - check ref exists
console.log(boardRef.current.renderBlocks);
```

### Clear all issues
1. Stop dev server
2. Clear browser cache
3. Restart dev server: `npm run dev`
4. Initialize socket: `curl http://localhost:3000/api/realtime/socket`
5. Hard refresh browser: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

---

## Getting Help

### Log Files to Check
1. Browser Console (F12 → Console)
2. Network Tab (F12 → Network)
3. React DevTools (Components tree)
4. Server Terminal (npm run dev output)

### Information to Include
When reporting issues:
- Error message (exact text)
- Error code (if any)
- Steps to reproduce
- Browser console logs
- Network tab screenshots
- Room ID and user ID

### Useful Commands
```bash
# Check Socket.IO status
curl http://localhost:3000/api/realtime/socket

# Check room exists
curl http://localhost:3000/api/rooms/room-1/join \
  --cookie "next-auth.session-token=YOUR_SESSION"

# Check permissions
curl http://localhost:3000/api/rooms/room-1/permissions \
  --cookie "next-auth.session-token=YOUR_SESSION"

# Check dev server running
curl http://localhost:3000/api/health

# View database
cat dev_db/dev_db.json | jq .
```

---

**Last Updated:** 2025-10-18
**Version:** 1.0
