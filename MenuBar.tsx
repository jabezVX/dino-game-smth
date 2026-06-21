import { useRef, useEffect, useState } from 'react';
import { useIDEStore } from '@/store/useIDEStore';
import type { MenuItem } from '@/types';

const MENU_DATA: Record<string, MenuItem[]> = {
  File: [
    { label: 'New File', shortcut: 'Ctrl+N', action: 'newFile' },
    { label: 'New Window', shortcut: 'Ctrl+Shift+N' },
    { separator: true, label: '' },
    { label: 'Open File', shortcut: 'Ctrl+O' },
    { label: 'Open Folder', shortcut: 'Ctrl+K Ctrl+O' },
    { separator: true, label: '' },
    { label: 'Save', shortcut: 'Ctrl+S', action: 'save' },
    { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
    { separator: true, label: '' },
    { label: 'Auto Save', checkbox: true, checked: false },
    { separator: true, label: '' },
    { label: 'Preferences', submenu: [
      { label: 'Settings', shortcut: 'Ctrl+,' },
      { label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
      { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S' },
    ]},
    { separator: true, label: '' },
    { label: 'Exit' },
  ],
  Edit: [
    { label: 'Undo', shortcut: 'Ctrl+Z' },
    { label: 'Redo', shortcut: 'Ctrl+Y' },
    { separator: true, label: '' },
    { label: 'Cut', shortcut: 'Ctrl+X' },
    { label: 'Copy', shortcut: 'Ctrl+C' },
    { label: 'Paste', shortcut: 'Ctrl+V' },
    { separator: true, label: '' },
    { label: 'Find', shortcut: 'Ctrl+F' },
    { label: 'Replace', shortcut: 'Ctrl+H' },
    { separator: true, label: '' },
    { label: 'Toggle Line Comment', shortcut: 'Ctrl+/' },
  ],
  Selection: [
    { label: 'Select All', shortcut: 'Ctrl+A' },
    { label: 'Expand Selection', shortcut: 'Shift+Alt+Right' },
    { label: 'Shrink Selection', shortcut: 'Shift+Alt+Left' },
    { separator: true, label: '' },
    { label: 'Copy Line Up', shortcut: 'Shift+Alt+Up' },
    { label: 'Copy Line Down', shortcut: 'Shift+Alt+Down' },
    { label: 'Move Line Up', shortcut: 'Alt+Up' },
    { label: 'Move Line Down', shortcut: 'Alt+Down' },
  ],
  View: [
    { label: 'Command Palette', shortcut: 'Ctrl+Shift+P', action: 'commandPalette' },
    { label: 'Open View', shortcut: 'Ctrl+Q' },
    { separator: true, label: '' },
    { label: 'Appearance', submenu: [
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B' },
      { label: 'Toggle Panel', shortcut: 'Ctrl+J' },
      { label: 'Toggle Status Bar' },
      { label: 'Toggle Activity Bar' },
    ]},
    { separator: true, label: '' },
    { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: 'explorer' },
    { label: 'Search', shortcut: 'Ctrl+Shift+F', action: 'search' },
    { label: 'Source Control', shortcut: 'Ctrl+Shift+G', action: 'scm' },
    { label: 'Run and Debug', shortcut: 'Ctrl+Shift+D', action: 'debug' },
    { label: 'Extensions', shortcut: 'Ctrl+Shift+X', action: 'extensions' },
  ],
  Go: [
    { label: 'Back', shortcut: 'Alt+Left' },
    { label: 'Forward', shortcut: 'Alt+Right' },
    { separator: true, label: '' },
    { label: 'Go to File', shortcut: 'Ctrl+P' },
    { label: 'Go to Symbol', shortcut: 'Ctrl+Shift+O' },
    { label: 'Go to Line', shortcut: 'Ctrl+G' },
  ],
  Run: [
    { label: 'Start Debugging', shortcut: 'F5' },
    { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' },
    { separator: true, label: '' },
    { label: 'Toggle Breakpoint', shortcut: 'F9' },
  ],
  Terminal: [
    { label: 'New Terminal', shortcut: 'Ctrl+Shift+`' },
    { label: 'Split Terminal' },
    { separator: true, label: '' },
    { label: 'Run Task' },
  ],
  Help: [
    { label: 'Welcome' },
    { label: 'Documentation' },
    { separator: true, label: '' },
    { label: 'About' },
  ],
};

export default function MenuBar() {
  const { activeMenu, setActiveMenu, toggleSidebar, setActiveView, openCommandPalette, newUntitledFile, sidebarVisible } = useIDEStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [, setHoveredMenu] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setHoveredMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveMenu]);

  const handleMenuClick = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
      setHoveredMenu(null);
    } else {
      setActiveMenu(menuName);
      setHoveredMenu(menuName);
    }
  };

  const handleMenuHover = (menuName: string) => {
    if (activeMenu) {
      setActiveMenu(menuName);
      setHoveredMenu(menuName);
    }
  };

  const handleAction = (action?: string) => {
    switch (action) {
      case 'newFile':
        newUntitledFile();
        break;
      case 'save':
        { const state = useIDEStore.getState();
        if (state.activeTab) {
          const content = state.files[state.activeTab]?.content || '';
          state.saveFileContent(state.activeTab, content);
        }
        break; }
      case 'commandPalette':
        openCommandPalette();
        break;
      case 'explorer':
        setActiveView('explorer');
        if (!sidebarVisible) toggleSidebar();
        break;
      case 'search':
        setActiveView('search');
        if (!sidebarVisible) toggleSidebar();
        break;
      case 'scm':
        setActiveView('scm');
        if (!sidebarVisible) toggleSidebar();
        break;
      case 'debug':
        setActiveView('debug');
        if (!sidebarVisible) toggleSidebar();
        break;
      case 'extensions':
        setActiveView('extensions');
        if (!sidebarVisible) toggleSidebar();
        break;
    }
    setActiveMenu(null);
    setHoveredMenu(null);
  };

  return (
    <div
      ref={menuRef}
      style={{
        height: 30,
        background: '#181818',
        borderBottom: '1px solid #2b2b2b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        userSelect: 'none',
        fontSize: 13,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.583.063a1.5 1.5 0 0 0-1.09.425L9.36 7.62 4.45 4.2A1.5 1.5 0 0 0 2 5.5v13a1.5 1.5 0 0 0 2.45 1.3l4.91-3.42 7.134 7.132a1.5 1.5 0 0 0 2.56-1.06V1.5a1.5 1.5 0 0 0-1.471-1.437zM17 19.793L10.436 13.23l6.564-6.563v13.126z" fill="#007acc"/>
        </svg>
      </div>
      {Object.keys(MENU_DATA).map((menuName) => (
        <div key={menuName} style={{ position: 'relative' }}>
          <div
            onClick={() => handleMenuClick(menuName)}
            onMouseEnter={() => handleMenuHover(menuName)}
            style={{
              padding: '0 10px',
              height: 30,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: activeMenu === menuName ? '#ffffff' : '#cccccc',
              background: activeMenu === menuName ? '#505050' : 'transparent',
            }}
            onMouseOver={(e) => {
              if (activeMenu && activeMenu !== menuName) {
                e.currentTarget.style.background = '#505050';
              } else if (!activeMenu) {
                e.currentTarget.style.background = '#505050';
              }
            }}
            onMouseOut={(e) => {
              if (activeMenu !== menuName) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {menuName}
          </div>
          {activeMenu === menuName && (
            <MenuDropdown
              items={MENU_DATA[menuName]}
              onAction={handleAction}
              onClose={() => { setActiveMenu(null); setHoveredMenu(null); }}
            />
          )}
        </div>
      ))}
      <div style={{ marginLeft: 'auto', color: '#cccccc', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>vs-code-web</span>
      </div>
    </div>
  );
}

function MenuDropdown({ items, onAction, onClose }: { items: MenuItem[]; onAction: (action?: string) => void; onClose: () => void }) {
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        minWidth: 240,
        background: '#252526',
        border: '1px solid #454545',
        boxShadow: '0 2px 8px rgba(0,0,0,0.36)',
        zIndex: 1000,
        padding: '4px 0',
        fontSize: 13,
      }}
    >
      {items.map((item, idx) => {
        if (item.separator) {
          return <div key={idx} style={{ height: 1, background: '#454545', margin: '4px 0' }} />;
        }
        return (
          <div
            key={idx}
            style={{ position: 'relative' }}
            onMouseEnter={() => item.submenu ? setOpenSubmenu(idx) : setOpenSubmenu(null)}
          >
            <div
              onClick={() => {
                if (!item.submenu) {
                  onAction(item.action);
                  onClose();
                }
              }}
              style={{
                height: 28,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: item.submenu ? 'default' : 'pointer',
                color: '#cccccc',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#094771'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.checkbox && (
                  <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.checked ? '✓' : ''}
                  </div>
                )}
                <span>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.shortcut && (
                  <span style={{ color: '#6e6e6e', fontSize: 12, marginLeft: 24 }}>{item.shortcut}</span>
                )}
                {item.submenu && (
                  <span style={{ color: '#cccccc', fontSize: 11 }}>▶</span>
                )}
              </div>
            </div>
            {item.submenu && openSubmenu === idx && (
              <div
                ref={submenuRef}
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: -4,
                  minWidth: 200,
                  background: '#252526',
                  border: '1px solid #454545',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.36)',
                  zIndex: 1001,
                  padding: '4px 0',
                }}
              >
                {item.submenu.map((sub, sidx) => (
                  <div
                    key={sidx}
                    onClick={() => { onAction(sub.action); onClose(); }}
                    style={{
                      height: 28,
                      padding: '0 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: '#cccccc',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#094771'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{sub.label}</span>
                    {sub.shortcut && <span style={{ color: '#6e6e6e', fontSize: 12 }}>{sub.shortcut}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
