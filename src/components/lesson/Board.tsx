'use client';

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

interface BoardProps {
  theme?: 'blackboard' | 'whiteboard';
  initialElements?: any[];
  onChange?: (elements: any[], appState: any, files: any) => void;
  editable?: boolean;
  onReady?: (api: any) => void;
  className?: string;
}

export interface BoardHandle {
  renderBlocks: (blocks: any[]) => void;
  setEditable: (editable: boolean) => void;
  getScene: () => { elements: any[]; appState: any };
}

export const Board = forwardRef<BoardHandle, BoardProps>(
  ({ theme = 'whiteboard', initialElements = [], onChange, editable = true, onReady, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);
    const [isEditable, setIsEditable] = useState(editable);

    // Update editable state when prop changes
    useEffect(() => {
      setIsEditable(editable);
    }, [editable]);

    // Theme configuration
    const excalidrawTheme = theme === 'blackboard' ? 'dark' : 'light';

    const themeStyles = {
      blackboard: {
        canvasBackground: '#0b0f19',
        gridColor: '#1a1f2e',
      },
      whiteboard: {
        canvasBackground: '#ffffff',
        gridColor: '#e5e5e5',
      },
    };

    const handleChange = (elements: readonly any[], appState: any, files: any) => {
      if (onChange) {
        onChange([...elements], appState, files);
      }
    };

    const handleExcalidrawAPI = (api: any) => {
      apiRef.current = api;

      // Force editable mode immediately
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

      // Call onReady callback
      if (onReady) {
        onReady(api);
      }
    };

    // Expose imperative methods via ref
    useImperativeHandle(ref, () => ({
      renderBlocks: (blocks: any[]) => {
        const api = apiRef.current;
        if (!api) return;

        const existingElements = api.getSceneElements();
        let yOffset = 100;

        const newElements = blocks.map((block, idx) => {
          const element = {
            id: `ai-block-${Date.now()}-${idx}`,
            type: 'text',
            x: 100,
            y: yOffset,
            width: 600,
            height: 100,
            angle: 0,
            strokeColor: theme === 'blackboard' ? '#ffffff' : '#000000',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 0,
            opacity: 100,
            groupIds: [],
            seed: Math.random(),
            version: 1,
            versionNonce: Math.random(),
            isDeleted: false,
            text: block.content || JSON.stringify(block),
            fontSize: 20,
            fontFamily: 1,
            textAlign: 'left',
            verticalAlign: 'top',
            baseline: 18,
            containerId: null,
            originalText: block.content || JSON.stringify(block),
          };

          yOffset += 120;
          return element;
        });

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

    // Development keyboard toggle (V key)
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

    return (
      <div
        ref={containerRef}
        className={`board-container ${theme} ${className}`}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          pointerEvents: 'auto',
        }}
      >
        <Excalidraw
          theme={excalidrawTheme}
          viewModeEnabled={!isEditable}
          initialData={{
            elements: initialElements,
            appState: {
              viewBackgroundColor: themeStyles[theme].canvasBackground,
              gridSize: 20,
              activeTool: { type: 'selection', customType: null, lastActiveTool: null, locked: false } as any,
              viewModeEnabled: !isEditable,
              zenModeEnabled: false,
              gridModeEnabled: true,
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
            },
            tools: {
              image: false,
            } as any,
          }}
        />

        <style jsx global>{`
          .board-container.blackboard {
            --color-primary: #e0e0e0;
            --color-text: #ffffff;
            font-family: 'Chalkboard', 'Comic Sans MS', cursive;
          }

          .board-container.whiteboard {
            --color-primary: #1a1a1a;
            --color-text: #000000;
          }

          .board-container .excalidraw {
            --color-surface-primary: ${theme === 'blackboard' ? '#0b0f19' : '#ffffff'};
          }
        `}</style>
      </div>
    );
  }
);

Board.displayName = 'Board';
