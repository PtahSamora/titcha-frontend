'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '@/lib/store';

type ToolTab = 'notes' | 'scratchpad' | 'equation' | 'upload';

interface ToolDockProps {
  onUpload: (file: File) => void;
  onEquation?: (latex: string) => void;
  className?: string;
}

export function ToolDock({ onUpload, onEquation, className = '' }: ToolDockProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>('notes');
  const [isExpanded, setIsExpanded] = useState(true);
  const { notes, setNotes, saveNotes } = useNotesStore();
  const [scratchpadText, setScratchpadText] = useState('');
  const [equationInput, setEquationInput] = useState('');

  const tabs = [
    { id: 'notes' as ToolTab, label: 'Notes', icon: '📝' },
    { id: 'scratchpad' as ToolTab, label: 'Scratch', icon: '✏️' },
    { id: 'equation' as ToolTab, label: 'Equation', icon: '∑' },
    { id: 'upload' as ToolTab, label: 'Upload', icon: '📷' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleEquationSubmit = () => {
    if (onEquation && equationInput.trim()) {
      onEquation(equationInput);
      setEquationInput('');
    }
  };

  const handleSaveNotes = () => {
    saveNotes();
    // Show brief confirmation (could use toast)
  };

  return (
    <div
      className={`tool-dock bg-white border-l border-gray-200 shadow-lg ${className}`}
      style={{
        width: isExpanded ? '320px' : '60px',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        {isExpanded && (
          <h3 className="text-sm font-semibold text-gray-700">Tools</h3>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '→' : '←'}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Lesson Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes during the lesson..."
                      className="w-full h-64 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'scratchpad' && (
                <motion.div
                  key="scratchpad"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Scratchpad
                    </label>
                    <textarea
                      value={scratchpadText}
                      onChange={(e) => setScratchpadText(e.target.value)}
                      placeholder="Work out problems here..."
                      className="w-full h-64 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono"
                    />
                    <button
                      onClick={() => setScratchpadText('')}
                      className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Clear Scratchpad
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'equation' && (
                <motion.div
                  key="equation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      LaTeX Equation
                    </label>
                    <textarea
                      value={equationInput}
                      onChange={(e) => setEquationInput(e.target.value)}
                      placeholder="Enter LaTeX equation...\nExample: \\frac{a}{b}"
                      className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono"
                    />
                    <button
                      onClick={handleEquationSubmit}
                      className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add to Board
                    </button>
                    <div className="mt-3 text-xs text-gray-600">
                      <p className="font-semibold mb-2">Quick Reference:</p>
                      <ul className="space-y-1">
                        <li><code>\frac{'{a}'}{'{b}'}</code> - Fraction</li>
                        <li><code>\sqrt{'{x}'}</code> - Square root</li>
                        <li><code>x^{'{2}'}</code> - Superscript</li>
                        <li><code>x_{'{i}'}</code> - Subscript</li>
                        <li><code>\int</code> - Integral</li>
                        <li><code>\sum</code> - Summation</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Upload Image for OCR
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <span className="text-4xl">📷</span>
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </span>
                      </label>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      <p className="font-semibold mb-2">How it works:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Upload an image with math or diagrams</li>
                        <li>AI will extract and explain the content</li>
                        <li>Results appear on the board</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
