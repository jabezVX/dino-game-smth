import { useState, useEffect, useRef, useMemo } from 'react';
import { useIDEStore } from '@/store/useIDEStore';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  action: () => void;
}

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openFile, setActiveView, toggleSidebar, togglePanel, newUntitledFile } = useIDEStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(() => {
    const all: Command[] = [
      { id: 'new-file', label: 'File: New File', shortcut: 'Ctrl+N', icon: '📄', action: () => { newUntitledFile(); closeCommandPalette(); } },
      { id: 'save', label: 'File: Save', shortcut: 'Ctrl+S', icon: '💾', action: () => { closeCommandPalette(); } },
      { id: 'explorer', label: 'View: Explorer', shortcut: 'Ctrl+Shift+E', icon: '📁', action: () => { setActiveView('explorer'); toggleSidebar(); closeCommandPalette(); } },
      { id: 'search', label: 'View: Search', shortcut: 'Ctrl+Shift+F', icon: '🔍', action: () => { setActiveView('search'); toggleSidebar(); closeCommandPalette(); } },
      { id: 'scm', label: 'View: Source Control', shortcut: 'Ctrl+Shift+G', icon: '🔀', action: () => { setActiveView('scm'); toggleSidebar(); closeCommandPalette(); } },
      { id: 'debug', label: 'View: Run and Debug', shortcut: 'Ctrl+Shift+D', icon: '🐛', action: () => { setActiveView('debug'); toggleSidebar(); closeCommandPalette(); } },
      { id: 'extensions', label: 'View: Extensions', shortcut: 'Ctrl+Shift+X', icon: '📦', action: () => { setActiveView('extensions'); toggleSidebar(); closeCommandPalette(); } },
      { id: 'toggle-sidebar', label: 'View: Toggle Sidebar', shortcut: 'Ctrl+B', icon: '◀', action: () => { toggleSidebar(); closeCommandPalette(); } },
      { id: 'toggle-panel', label: 'View: Toggle Panel', shortcut: 'Ctrl+J', icon: '▼', action: () => { togglePanel(); closeCommandPalette(); } },
      { id: 'open-app', label: 'Open: App.tsx', icon: '📄', action: () => { openFile('vscode-web/src/App.tsx'); closeCommandPalette(); } },
      { id: 'open-index', label: 'Open: index.ts', icon: '📄', action: () => { openFile('vscode-web/src/index.ts'); closeCommandPalette(); } },
      { id: 'open-types', label: 'Open: types.ts', icon: '📄', action: () => { openFile('vscode-web/src/types.ts'); closeCommandPalette(); } },
      { id: 'open-readme', label: 'Open: README.md', icon: '📄', action: () => { openFile('vscode-web/README.md'); closeCommandPalette(); } },
      { id: 'open-package', label: 'Open: package.json', icon: '📄', action: () => { openFile('vscode-web/package.json'); closeCommandPalette(); } },
    ];
    return all;
  }, [closeCommandPalette, newUntitledFile, openFile, setActiveView, togglePanel, toggleSidebar]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!commandPaletteOpen) return;
      
      if (e.key === 'Escape') {
        closeCommandPalette();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, closeCommandPalette, filtered, selectedIndex]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100000,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={closeCommandPalette}
    >
      <div
        style={{
          width: 600,
          maxHeight: 400,
          background: '#252526',
          border: '1px solid #454545',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 6,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #454545' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            style={{
              width: '100%',
              height: 32,
              background: '#3c3c3c',
              border: '1px solid #007acc',
              borderRadius: 3,
              color: '#cccccc',
              padding: '0 10px',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'system-ui, sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div ref={listRef} style={{ overflow: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#858585', fontSize: 13 }}>
              No matching commands
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => { cmd.action(); }}
                style={{
                  height: 36,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  background: idx === selectedIndex ? '#094771' : 'transparent',
                }}
                onMouseOver={() => setSelectedIndex(idx)}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{cmd.icon}</span>
                <span style={{ flex: 1, color: '#cccccc', fontSize: 13 }}>{highlightMatch(cmd.label, query)}</span>
                {cmd.shortcut && (
                  <span style={{ color: '#6e6e6e', fontSize: 11 }}>{cmd.shortcut}</span>
                )}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            height: 28,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderTop: '1px solid #454545',
            color: '#858585',
            fontSize: 11,
          }}
        >
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: '#ffffff', fontWeight: 600 }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
