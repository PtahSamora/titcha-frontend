import throttle from 'lodash.throttle';
import { Socket } from 'socket.io-client';

/**
 * Sets up throttled scene broadcasting for Excalidraw collaboration
 * @param roomId - The room ID to broadcast to
 * @param socket - Socket.IO client instance
 * @param onChange - Excalidraw onChange callback
 * @returns Cleanup function
 */
export function setupExcalidrawSync(
  roomId: string,
  socket: Socket,
  onChange: (elements: readonly any[], appState: any, files: any) => void
) {
  // Throttled broadcast function (max once per 200ms)
  const broadcastScene = throttle(
    (elements: readonly any[], appState: any) => {
      if (socket.connected) {
        socket.emit('room:scene', {
          roomId,
          elements: elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            currentItemStrokeColor: appState.currentItemStrokeColor,
            currentItemBackgroundColor: appState.currentItemBackgroundColor,
            currentItemFillStyle: appState.currentItemFillStyle,
            currentItemStrokeWidth: appState.currentItemStrokeWidth,
            currentItemRoughness: appState.currentItemRoughness,
            currentItemOpacity: appState.currentItemOpacity,
          },
        });
      }
    },
    200,
    { leading: true, trailing: true }
  );

  // Return wrapped onChange handler
  return {
    onChange: (elements: readonly any[], appState: any, files: any) => {
      // Call original handler
      onChange(elements, appState, files);

      // Broadcast changes
      broadcastScene(elements, appState);
    },
    cleanup: () => {
      broadcastScene.cancel();
    },
  };
}

/**
 * Sets up listener for incoming scene updates
 * @param socket - Socket.IO client instance
 * @param onSceneUpdate - Callback to update Excalidraw scene
 * @returns Cleanup function
 */
export function setupSceneListener(
  socket: Socket,
  onSceneUpdate: (elements: any[], appState: any) => void
) {
  const handleSceneUpdate = ({ elements, appState }: { elements: any[]; appState: any }) => {
    onSceneUpdate(elements, appState);
  };

  socket.on('room:scene-update', handleSceneUpdate);

  return () => {
    socket.off('room:scene-update', handleSceneUpdate);
  };
}
