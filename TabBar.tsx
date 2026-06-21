import { useState, useEffect } from 'react';
import { useIDEStore } from '@/store/useIDEStore';
import { getFileName } from '@/lib/fileSystem';

export default function TabBar() {
  const { openTabs, activeTab, setActiveTab, closeTab, closeAllTabs, closeOtherTabs, closeTabsToRight, newUntitledFile, dirtyTabs } = useIDEStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  useEffect(() => {
    function handleClick() { setContextMenu(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      style={{
        height: 35,
        background: '#181818',
        borderBottom: '1px solid #2b2b2b',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {openTabs.map(path => {
        const isActive = activeTab === path;
        const name = getFileName(path);
        const isDirty = dirtyTabs.has(path);
        return (
          <div
            key={path}
            onClick={() => setActiveTab(path)}
            onContextMenu={(e) => handleContextMenu(e, path)}
            onMouseUp={(e) => { if (e.button === 1) { e.preventDefault(); closeTab(path); } }}
            style={{
              minWidth: 120,
              maxWidth: 200,
              height: 35,
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              background: isActive ? '#1e1e1e' : 'transparent',
              color: isActive ? '#ffffff' : '#969696',
              borderTop: isActive ? '1px solid #007acc' : '1px solid transparent',
              borderRight: '1px solid #2b2b2b',
              fontSize: 12,
              position: 'relative',
              userSelect: 'none',
            }}
            onMouseOver={(e) => {
              if (!isActive) e.currentTarget.style.background = '#1e1e1e';
            }}
            onMouseOut={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isDirty && <span style={{ color: '#ffffff', marginRight: 4, fontSize: 8 }}>●</span>}
              {name}
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); closeTab(path); }}
              style={{
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                fontSize: 14,
                color: '#969696',
                visibility: 'visible',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#3c3c3c'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#969696'; }}
            >
              ×
            </span>
          </div>
        );
      })}

      {/* New Tab button */}
      <button
        onClick={() => newUntitledFile()}
        style={{
          width: 35,
          height: 35,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#858585',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#1e1e1e'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = '#858585'; e.currentTarget.style.background = 'transparent'; }}
        title="New File"
      >
        +
      </button>

      {/* Tab context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: '#252526',
            border: '1px solid #454545',
            boxShadow: '0 2px 8px rgba(0,0,0,0.36)',
            zIndex: 10000,
            minWidth: 160,
            padding: '4px 0',
          }}
        >
          <MenuItem label="Close" onClick={() => { closeTab(contextMenu.path); setContextMenu(null); }} />
          <MenuItem label="Close Others" onClick={() => { closeOtherTabs(contextMenu.path); setContextMenu(null); }} />
          <MenuItem label="Close to the Right" onClick={() => { closeTabsToRight(contextMenu.path); setContextMenu(null); }} />
          <MenuItem label="Close All" onClick={() => { closeAllTabs(); setContextMenu(null); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        height: 28,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#cccccc',
        fontSize: 13,
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = '#094771'; }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </div>
  );
}
