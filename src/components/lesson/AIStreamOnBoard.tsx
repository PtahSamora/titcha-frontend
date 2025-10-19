'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LessonBlock } from '@/lib/store';
import 'katex/dist/katex.min.css';

// Dynamic import for KaTeX to avoid SSR issues
const renderMath = async (latex: string): Promise<string> => {
  if (typeof window === 'undefined') return latex;

  try {
    const katex = await import('katex');
    return katex.default.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
    });
  } catch (err) {
    console.error('KaTeX error:', err);
    return latex;
  }
};

interface AIStreamOnBoardProps {
  blocks: LessonBlock[];
  boardTheme: 'blackboard' | 'whiteboard';
  className?: string;
}

export function AIStreamOnBoard({ blocks, boardTheme, className = '' }: AIStreamOnBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const themeClasses = {
    blackboard: 'bg-[#0b0f19] text-white',
    whiteboard: 'bg-white text-gray-900',
  };

  return (
    <div
      ref={containerRef}
      className={`ai-stream-container ${themeClasses[boardTheme]} ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <AnimatePresence>
        {blocks.map((block, index) => (
          <BlockRenderer
            key={block.id}
            block={block}
            index={index}
            theme={boardTheme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface BlockRendererProps {
  block: LessonBlock;
  index: number;
  theme: 'blackboard' | 'whiteboard';
}

function BlockRenderer({ block, index, theme }: BlockRendererProps) {
  const [mathHtml, setMathHtml] = React.useState<string>('');

  useEffect(() => {
    if (block.type === 'math' && block.latex) {
      renderMath(block.latex).then(setMathHtml);
    }
  }, [block.type, block.latex]);

  const basePosition = {
    x: block.x ?? 50 + (index % 3) * 300,
    y: block.y ?? 100 + Math.floor(index / 3) * 150,
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div
            className={`text-lg p-4 rounded-lg max-w-md ${
              theme === 'blackboard'
                ? 'bg-slate-800/80 text-white border border-slate-600'
                : 'bg-white/90 text-gray-900 border border-gray-200 shadow-lg'
            }`}
          >
            {block.content}
          </div>
        );

      case 'math':
        return (
          <div
            className={`p-4 rounded-lg ${
              theme === 'blackboard'
                ? 'bg-slate-800/80 text-white border border-slate-600'
                : 'bg-blue-50/90 text-gray-900 border border-blue-200 shadow-lg'
            }`}
          >
            {mathHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: mathHtml }}
                className="katex-display"
              />
            ) : (
              <div className="text-sm italic">{block.latex}</div>
            )}
          </div>
        );

      case 'point':
        return (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              theme === 'blackboard'
                ? 'bg-yellow-900/80 text-yellow-100 border border-yellow-600'
                : 'bg-yellow-50/90 text-yellow-900 border border-yellow-300 shadow-lg'
            }`}
          >
            <span className="text-2xl">👉</span>
            <span className="text-sm font-medium">{block.content}</span>
          </div>
        );

      case 'image':
        return block.imageUrl ? (
          <div
            className={`rounded-lg overflow-hidden ${
              theme === 'blackboard'
                ? 'border border-slate-600'
                : 'border border-gray-200 shadow-lg'
            }`}
          >
            <img
              src={block.imageUrl}
              alt="Lesson content"
              className="max-w-sm max-h-64 object-contain"
            />
          </div>
        ) : null;

      case 'diagram':
        return (
          <div
            className={`p-4 rounded-lg ${
              theme === 'blackboard'
                ? 'bg-slate-800/80 text-white border border-slate-600'
                : 'bg-gray-50/90 text-gray-900 border border-gray-200 shadow-lg'
            }`}
          >
            <div className="text-sm italic">Diagram: {block.content}</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      style={{
        position: 'absolute',
        left: basePosition.x,
        top: basePosition.y,
        pointerEvents: 'auto',
      }}
    >
      {renderContent()}
    </motion.div>
  );
}
