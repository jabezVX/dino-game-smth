import { useEffect, useRef, useCallback, useState } from 'react';
import { useIDEStore } from '@/store/useIDEStore';
import MenuBar from '@/components/MenuBar';
import ActivityBar from '@/components/ActivityBar';
import TabBar from '@/components/TabBar';
import MonacoEditor from '@/components/Editor';
import Panel from '@/components/Panel';
import StatusBar from '@/components/StatusBar';
import CommandPalette from '@/components/CommandPalette';
import ExplorerView from '@/components/views/ExplorerView';
import SearchView from '@/components/views/SearchView';
import ScmView from '@/components/views/ScmView';
import DebugView from '@/components/views/DebugView';
import ExtensionsView from '@/components/views/ExtensionsView';

function Sidebar() {
  const { activeView } = useIDEStore();

  const renderView = () => {
    switch (activeView) {
      case 'explorer': return <ExplorerView />;
      case 'search': return <SearchView />;
      case 'scm': return <ScmView />;
      case 'debug': return <DebugView />;
      case 'extensions': return <ExtensionsView />;
      default: return <ExplorerView />;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#181818',
        overflow: 'hidden',
      }}
    >
      {renderView()}
    </div>
  );
}

export default function App() {
  const { initialize, sidebarVisible, panelVisible, sidebarWidth, setSidebarWidth, panelHeight, setPanelHeight, activeMenu, setActiveMenu, openCommandPalette, commandPaletteOpen, closeCommandPalette, toggleSidebar, togglePanel } = useIDEStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSidebar = useRef(false);
  const isDraggingPanel = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const [sidebarW, setSidebarW] = useState(sidebarWidth);
  const [panelH, setPanelH] = useState(panelHeight);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize store from IndexedDB
  useEffect(() => {
    initialize().then(() => setIsLoading(false));
  }, [initialize]);

  // Sync local state with store
  useEffect(() => { setSidebarW(sidebarWidth); }, [sidebarWidth]);
  useEffect(() => { setPanelH(panelHeight); }, [panelHeight]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Escape to close command palette
        if (e.key === 'Escape' && commandPaletteOpen) {
          closeCommandPalette();
          return;
        }
        return;
      }

      // Close menus on Escape
      if (e.key === 'Escape') {
        if (activeMenu) {
          setActiveMenu(null);
          return;
        }
      }

      // Ctrl+Shift+P / F1 - Command Palette
      if ((e.ctrlKey && e.shiftKey && e.key === 'P') || e.key === 'F1') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Ctrl+B - Toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl+J - Toggle panel
      if (e.ctrlKey && e.key === 'j') {
        e.preventDefault();
        togglePanel();
        return;
      }

      // Ctrl+N - New file
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        useIDEStore.getState().newUntitledFile();
        return;
      }

      // Ctrl+W - Close tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const state = useIDEStore.getState();
        if (state.activeTab) state.closeTab(state.activeTab);
        return;
      }

      // Ctrl+Shift+E - Explorer
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const state = useIDEStore.getState();
        state.setActiveView('explorer');
        if (!state.sidebarVisible) state.toggleSidebar();
        return;
      }

      // Ctrl+Shift+F - Search
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        const state = useIDEStore.getState();
        state.setActiveView('search');
        if (!state.sidebarVisible) state.toggleSidebar();
        return;
      }

      // Ctrl+Shift+G - SCM
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        const state = useIDEStore.getState();
        state.setActiveView('scm');
        if (!state.sidebarVisible) state.toggleSidebar();
        return;
      }

      // Ctrl+Shift+D - Debug
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const state = useIDEStore.getState();
        state.setActiveView('debug');
        if (!state.sidebarVisible) state.toggleSidebar();
        return;
      }

      // Ctrl+Shift+X - Extensions
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        const state = useIDEStore.getState();
        state.setActiveView('extensions');
        if (!state.sidebarVisible) state.toggleSidebar();
        return;
      }

      // Ctrl+` - Toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        const state = useIDEStore.getState();
        if (!state.panelVisible) state.togglePanel();
        state.setPanelActiveTab('terminal');
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeMenu, commandPaletteOpen, setActiveMenu, openCommandPalette, closeCommandPalette, toggleSidebar, togglePanel]);

  // Drag handlers for sidebar resize
  const handleSidebarDragStart = useCallback((e: React.MouseEvent) => {
    isDraggingSidebar.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarW;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarW]);

  // Drag handlers for panel resize
  const handlePanelDragStart = useCallback((e: React.MouseEvent) => {
    isDraggingPanel.current = true;
    startY.current = e.clientY;
    startHeight.current = panelH;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [panelH]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDraggingSidebar.current) {
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(170, Math.min(600, startWidth.current + delta));
        setSidebarW(newWidth);
      }
      if (isDraggingPanel.current) {
        const delta = startY.current - e.clientY;
        const newHeight = Math.max(100, Math.min(500, startHeight.current + delta));
        setPanelH(newHeight);
      }
    }

    function handleMouseUp() {
      if (isDraggingSidebar.current) {
        isDraggingSidebar.current = false;
        setSidebarWidth(sidebarW);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      if (isDraggingPanel.current) {
        isDraggingPanel.current = false;
        setPanelHeight(panelH);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sidebarW, panelH, setSidebarWidth, setPanelHeight]);

  if (isLoading) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#cccccc' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 16px' }}>
            <path d="M17.583.063a1.5 1.5 0 0 0-1.09.425L9.36 7.62 4.45 4.2A1.5 1.5 0 0 0 2 5.5v13a1.5 1.5 0 0 0 2.45 1.3l4.91-3.42 7.134 7.132a1.5 1.5 0 0 0 2.56-1.06V1.5a1.5 1.5 0 0 0-1.471-1.437zM17 19.793L10.436 13.23l6.564-6.563v13.126z" fill="#007acc"/>
          </svg>
          <p style={{ fontSize: 14, color: '#858585' }}>Loading VS Code: Web...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1e1e1e',
        overflow: 'hidden',
      }}
    >
      <MenuBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ActivityBar />

        {/* Sidebar */}
        {sidebarVisible && (
          <>
            <div style={{ width: sidebarW, flexShrink: 0, overflow: 'hidden' }}>
              <Sidebar />
            </div>
            {/* Sidebar resize handle */}
            <div
              onMouseDown={handleSidebarDragStart}
              style={{
                width: 4,
                cursor: 'col-resize',
                background: 'transparent',
                flexShrink: 0,
                position: 'relative',
                zIndex: 10,
              }}
              onMouseOver={(e) => { if (!isDraggingSidebar.current) e.currentTarget.style.background = '#007acc'; }}
              onMouseOut={(e) => { if (!isDraggingSidebar.current) e.currentTarget.style.background = 'transparent'; }}
            />
          </>
        )}

        {/* Main content: Editor + Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Editor area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <TabBar />
            <MonacoEditor />
          </div>

          {/* Panel */}
          {panelVisible && (
            <>
              {/* Panel resize handle */}
              <div
                onMouseDown={handlePanelDragStart}
                style={{
                  height: 4,
                  cursor: 'row-resize',
                  background: 'transparent',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 10,
                }}
                onMouseOver={(e) => { if (!isDraggingPanel.current) e.currentTarget.style.background = '#007acc'; }}
                onMouseOut={(e) => { if (!isDraggingPanel.current) e.currentTarget.style.background = 'transparent'; }}
              />
              <div style={{ height: panelH, flexShrink: 0 }}>
                <Panel />
              </div>
            </>
          )}
        </div>
      </div>

      <StatusBar />
      <CommandPalette />
    </div>
  );
}
