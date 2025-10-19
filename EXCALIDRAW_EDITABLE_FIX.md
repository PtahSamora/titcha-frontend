# Excalidraw Editable State Fix - Implementation Summary

## Overview
Fixed the Excalidraw board being locked/read-only after joining a study room. The board now correctly initializes in editable mode with the selection tool active.

---

## Problem Statement

After successfully joining a study room, the Excalidraw board was in a locked/read-only state (padlock shown). Users couldn't draw or interact with the canvas despite being authenticated members of the room.

**Root causes:**
1. Board component didn't expose API to control editable state
2. No explicit initialization of `viewModeEnabled=false`
3. Default tool was "hand" instead of "selection"
4. No way to programmatically force editable state after API ready

---

## Solution Implementation

### 1. **Updated Board Component** (`src/components/lesson/Board.tsx`)

#### Key Changes:

**A. ForwardRef Pattern with Imperative API**
```typescript
export interface BoardHandle {
  renderBlocks: (blocks: any[]) => void;
  setEditable: (editable: boolean) => void;
  getScene: () => { elements: any[]; appState: any };
}

export const Board = forwardRef<BoardHandle, BoardProps>(
  ({ theme, initialElements, onChange, editable = true, onReady, className }, ref) => {
    // ...
  }
);
```

**B. Editable Prop with State Management**
```typescript
const [isEditable, setIsEditable] = useState(editable);

useEffect(() => {
  setIsEditable(editable);
}, [editable]);
```

**C. Force Editable After API Ready**
```typescript
const handleExcalidrawAPI = (api: any) => {
  apiRef.current = api;

  // Force editable mode immediately after API ready
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

  if (onReady) onReady(api);
};
```

**D. Excalidraw Props Configuration**
```typescript
<Excalidraw
  theme={excalidrawTheme}
  viewModeEnabled={!isEditable}  // Explicitly controlled
  initialData={{
    elements: initialElements,
    appState: {
      viewBackgroundColor: themeStyles[theme].canvasBackground,
      gridSize: 20,
      activeTool: { type: 'selection' },  // Default to selection, NOT hand
      viewModeEnabled: !isEditable,
    },
  }}
  onChange={handleChange}
  excalidrawAPI={handleExcalidrawAPI}
  UIOptions={{
    canvasActions: {
      changeViewBackgroundColor: true,
      clearCanvas: true,
      export: false,
      loadScene: false,
      saveToActiveFile: false,
      toggleTheme: true,
      toggleViewMode: true,  // Allow manual toggle
    },
    tools: {
      hand: true,
    },
  }}
/>
```

**E. UseImperativeHandle for Ref API**
```typescript
useImperativeHandle(ref, () => ({
  renderBlocks: (blocks: any[]) => {
    const api = apiRef.current;
    if (!api) return;

    const existingElements = api.getSceneElements();
    let yOffset = 100;

    const newElements = blocks.map((block, idx) => ({
      id: `ai-block-${Date.now()}-${idx}`,
      type: 'text',
      x: 100,
      y: yOffset,
      width: 600,
      height: 100,
      text: block.content || JSON.stringify(block),
      fontSize: 20,
      strokeColor: theme === 'blackboard' ? '#ffffff' : '#000000',
      // ... full Excalidraw element config
    }));

    api.updateScene({
      elements: [...existingElements, ...newElements],
    });
  },

  setEditable: (newEditable: boolean) => {
    setIsEditable(newEditable);
    const api = apiRef.current;
    if (api) {
      api.updateScene({
        appState: {
          viewModeEnabled: !newEditable,
          activeTool: newEditable ? { type: 'selection' } : undefined,
        },
      });
    }
  },

  getScene: () => {
    const api = apiRef.current;
    if (!api) return { elements: [], appState: {} };
    return {
      elements: api.getSceneElements(),
      appState: api.getAppState(),
    };
  },
}));
```

**F. Development Keyboard Toggle (V Key)**
```typescript
useEffect(() => {
  if (process.env.NODE_ENV !== 'production') {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') {
        const api = apiRef.current;
        if (api) {
          const currentState = api.getAppState();
          const newViewMode = !currentState.viewModeEnabled;
          api.updateScene({
            appState: {
              viewModeEnabled: newViewMode,
              activeTool: newViewMode ? undefined : { type: 'selection' },
            },
          });
          console.log('[Board] View mode toggled:', newViewMode ? 'LOCKED' : 'EDITABLE');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}, []);
```

**G. No Blocking Overlays**
```typescript
<div
  ref={containerRef}
  className={`board-container ${theme} ${className}`}
  style={{
    width: '100%',
    height: '100%',
    position: 'relative',
    pointerEvents: 'auto',  // Ensure events are not blocked
  }}
>
```

---

### 2. **Updated RoomLayout Component** (`src/components/rooms/RoomLayout.tsx`)

#### Key Changes:

**A. Import BoardHandle Type**
```typescript
import { Board, BoardHandle } from '@/components/lesson/Board';
```

**B. Typed Ref**
```typescript
const boardRef = useRef<BoardHandle>(null);
```

**C. Pass Editable={true} and OnReady Callback**
```typescript
<Board
  ref={boardRef}
  theme={theme}
  initialElements={initialSnapshot?.elements || []}
  editable={true}  // Always editable when room is joined
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
```

**D. Use Ref API for AI Blocks**
```typescript
const handleAiBlocks = (blocks: any[]) => {
  console.log('[Room] AI blocks received:', blocks);

  if (boardRef.current?.renderBlocks) {
    boardRef.current.renderBlocks(blocks);
  }
};
```

---

### 3. **Join API Verification** (`src/app/api/rooms/[roomId]/join/route.ts`)

The join API already returns explicit success response:

```typescript
return NextResponse.json(
  {
    success: true,
    joined: true,
    room: { id, name, subject, ownerUserId, inviteCode },
    members: membersWithRole,
    snapshot: snapshot?.snapshot || null,
    permissions: { askAiEnabled, memberAskAi },
    me: { id: user.userId, isOwner: room.ownerUserId === user.userId },
  },
  { status: 200 }
);
```

**Error responses are deterministic:**
- `ROOM_NOT_FOUND` (404)
- `CROSS_SCHOOL` (403)
- `OWNER_NOT_FOUND` (500)
- `UNAUTHORIZED` (401)
- `INTERNAL_ERROR` (500)

---

## Testing Guide

### ✅ Acceptance Tests

#### Test 1: Board Editable After Join
1. Login as student user
2. Navigate to study room: `/portal/student/room/room-1`
3. Wait for join flow to complete
4. **Expected:** Board should be editable (no padlock)
5. **Verify:** Can draw, select, move elements freely
6. **Verify:** Active tool is "selection" (not hand)

#### Test 2: Keyboard Toggle (Development Only)
1. Join a room (see Test 1)
2. Press "V" key on keyboard
3. **Expected:** Console logs: `[Board] View mode toggled: LOCKED`
4. **Expected:** Board becomes read-only
5. Press "V" again
6. **Expected:** Console logs: `[Board] View mode toggled: EDITABLE`
7. **Expected:** Board becomes editable again

#### Test 3: AI Blocks Rendering
1. Join room as owner
2. Type question in chat: "What is calculus?"
3. Click "Ask AI" button
4. **Expected:** AI blocks render on board as text elements
5. **Expected:** All room members see the blocks
6. **Expected:** Blocks are editable/movable like normal elements

#### Test 4: SetEditable Method
1. Open browser console
2. Join a room
3. Run in console:
   ```javascript
   // Access boardRef through React DevTools or global
   boardRef.current.setEditable(false);
   ```
4. **Expected:** Board becomes read-only
5. Run: `boardRef.current.setEditable(true);`
6. **Expected:** Board becomes editable again

#### Test 5: GetScene Method
1. Join room and draw some elements
2. Run in console:
   ```javascript
   const scene = boardRef.current.getScene();
   console.log(scene);
   ```
3. **Expected:** Returns object with `elements` and `appState`
4. **Verify:** Elements array contains your drawings

#### Test 6: Theme Toggle Preserves Editable State
1. Join room (board is editable)
2. Draw some elements
3. Click theme toggle (blackboard ↔ whiteboard)
4. **Expected:** Theme changes but board remains editable
5. **Verify:** Can still draw and select elements

#### Test 7: No Blocking Overlays
1. Join room
2. Inspect board container element
3. **Verify:** CSS has `pointerEvents: 'auto'`
4. **Verify:** No invisible overlays blocking clicks
5. Try clicking all areas of the board
6. **Expected:** All clicks register on Excalidraw canvas

---

## Technical Details

### Excalidraw State Management

**viewModeEnabled:**
- `false` = Editable (can draw, select, move)
- `true` = Read-only (padlock, hand tool only)

**activeTool:**
- `{ type: 'selection' }` = Default tool for editing
- `{ type: 'hand' }` = Pan/scroll only (read-only feel)
- `undefined` = No tool selected (view mode)

**Proper initialization flow:**
1. Set `viewModeEnabled={!isEditable}` prop on Excalidraw
2. Set `initialData.appState.activeTool = { type: 'selection' }`
3. Set `initialData.appState.viewModeEnabled = !isEditable`
4. After API ready, force: `api.updateScene({ appState: { viewModeEnabled: false, activeTool: { type: 'selection' } } })`

### Why setTimeout(100)?

The `setTimeout` in `handleExcalidrawAPI` ensures:
1. Excalidraw API is fully initialized
2. Internal state is ready for updates
3. Prevents race conditions with initialization

Without it, calling `api.updateScene` immediately may be ignored or cause errors.

### ForwardRef Pattern Benefits

Using `forwardRef` with `useImperativeHandle` allows:
1. Parent components to call methods on child: `boardRef.current.renderBlocks()`
2. Encapsulation: Internal API state hidden, only expose needed methods
3. Type safety: `BoardHandle` interface defines contract
4. Future extensibility: Easy to add new methods like `clearBoard()`, `exportPNG()`

---

## Files Modified

### Created:
- None (all modifications to existing files)

### Modified:
1. **`src/components/lesson/Board.tsx`**
   - Complete rewrite with forwardRef pattern
   - Added BoardHandle interface
   - Added editable prop and state management
   - Added imperative API: renderBlocks, setEditable, getScene
   - Added development keyboard toggle
   - Fixed viewModeEnabled and activeTool initialization

2. **`src/components/rooms/RoomLayout.tsx`**
   - Import BoardHandle type
   - Changed boardRef type from `any` to `BoardHandle`
   - Updated Board component props: added ref, editable={true}, onReady
   - Added onReady callback to force editable state
   - Updated handleAiBlocks to use ref API

### Unchanged (Already Correct):
- `src/app/api/rooms/[roomId]/join/route.ts` - Already returns explicit success
- `src/app/portal/student/room/[roomId]/page.tsx` - Join flow already correct

---

## Known Limitations

1. **Keyboard Toggle (V) Development Only:**
   - Only works in `NODE_ENV !== 'production'`
   - For debugging purposes
   - Remove or guard in production builds

2. **AI Blocks as Text Only:**
   - Currently renders as simple text elements
   - Future: Support rich formatting (math, code, images)

3. **No Autosave for Board:**
   - Board state not auto-saved yet
   - Future: Use `boardRef.current.getScene()` with throttled autosave

4. **Theme Doesn't Persist:**
   - Theme toggle resets on page refresh
   - Future: Store in localStorage or user preferences

---

## Future Enhancements

### 1. Autosave Implementation
```typescript
import throttle from 'lodash.throttle';

const autosave = throttle(async () => {
  if (!boardRef.current?.getScene) return;
  const scene = boardRef.current.getScene();
  await fetch(`/api/rooms/${roomId}/state`, {
    method: 'POST',
    body: JSON.stringify({ snapshot: scene }),
  });
}, 5000);

// In Board onChange:
onChange={(elements, appState, files) => {
  autosave();
}}
```

### 2. Rich AI Blocks
```typescript
renderBlocks: (blocks: any[]) => {
  const newElements = blocks.map((block) => {
    switch (block.type) {
      case 'math':
        return createLatexElement(block.content);
      case 'code':
        return createCodeElement(block.content, block.language);
      case 'image':
        return createImageElement(block.url);
      default:
        return createTextElement(block.content);
    }
  });
}
```

### 3. Collaborative Cursors
```typescript
// In RoomLayout, listen for cursor events
socket.on('cursor:move', ({ userId, x, y }) => {
  boardRef.current?.showCursor(userId, { x, y });
});
```

### 4. Export Functionality
```typescript
// Add to BoardHandle interface
export: (format: 'png' | 'svg' | 'json') => Promise<Blob>;

// Implementation
export: async (format) => {
  const api = apiRef.current;
  if (!api) throw new Error('API not ready');
  return await api.exportToBlob({ format });
}
```

---

## Debugging Tips

### Issue: Board Still Locked After Join

**Check:**
1. Browser console for errors
2. Run: `boardRef.current` - should not be null
3. Inspect Excalidraw state:
   ```javascript
   const state = boardRef.current.getScene();
   console.log(state.appState.viewModeEnabled); // Should be false
   ```
4. Press "V" to manually toggle

**Fix:**
- Clear cache and hard reload
- Check `editable` prop is set to `true`
- Verify `onReady` callback is firing

### Issue: Keyboard Toggle Not Working

**Check:**
1. Is `NODE_ENV` set to development?
2. Browser console for event listener errors
3. Try pressing "V" multiple times

**Fix:**
- Run: `console.log(process.env.NODE_ENV)`
- Should log: `"development"`

### Issue: AI Blocks Not Rendering

**Check:**
1. Is `boardRef.current` defined?
2. Does `boardRef.current.renderBlocks` exist?
3. Are blocks passed correctly from chat panel?

**Fix:**
- Log in handleAiBlocks: `console.log(boardRef.current)`
- Verify socket event received: `console.log('ai:blocks', blocks)`

---

## Summary

✅ **Fixed:** Excalidraw board now editable after room join
✅ **Default Tool:** Selection (not hand)
✅ **Imperative API:** Parent can call renderBlocks, setEditable, getScene
✅ **Development Toggle:** Press "V" to toggle view mode
✅ **No Overlays:** All pointer events enabled
✅ **Join API:** Returns explicit success response
✅ **Type Safety:** BoardHandle interface defines contract

**Implementation Date:** 2025-10-18
**Version:** Excalidraw Fix v1.0
**Status:** ✅ Complete - Ready for Testing
