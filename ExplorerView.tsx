import { useState, useRef, useEffect, useCallback } from 'react';
import { useIDEStore } from '@/store/useIDEStore';
import type { TreeNode } from '@/types';
import { flattenTree, getLanguageFromFileName } from '@/lib/fileSystem';

const FILE_ICONS: Record<string, { color: string; abbr: string }> = {
  javascript: { color: '#f1e05a', abbr: 'JS' },
  typescript: { color: '#2b7489', abbr: 'TS' },
  python: { color: '#3572A5', abbr: 'PY' },
  html: { color: '#e34c26', abbr: 'H' },
  css: { color: '#563d7c', abbr: 'CSS' },
  json: { color: '#f1e05a', abbr: '{}' },
  markdown: { color: '#083fa1', abbr: 'Md' },
  java: { color: '#b07219', abbr: 'Ja' },
  cpp: { color: '#f34b7d', abbr: 'C++' },
  csharp: { color: '#178600', abbr: 'C#' },
  go: { color: '#00ADD8', abbr: 'Go' },
  rust: { color: '#dea584', abbr: 'RS' },
  php: { color: '#4F5D95', abbr: 'PHP' },
  ruby: { color: '#701516', abbr: 'RB' },
  swift: { color: '#ffac45', abbr: 'SW' },
  kotlin: { color: '#A97BFF', abbr: 'KT' },
  sql: { color: '#e38c00', abbr: 'SQL' },
  yaml: { color: '#cb171e', abbr: 'YML' },
  xml: { color: '#0060ac', abbr: 'XML' },
  shell: { color: '#89e051', abbr: 'SH' },
  dockerfile: { color: '#384d54', abbr: 'DK' },
  plaintext: { color: '#6e6e6e', abbr: 'T' },
};

function FileIcon({ language, name }: { language?: string; name: string }) {
  const lang = language || getLanguageFromFileName(name);
  const icon = FILE_ICONS[lang] || FILE_ICONS.plaintext;
  return (
    <div
      style={{
        width: 16,
        height: 16,
        background: icon.color,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 7,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        marginRight: 6,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {icon.abbr}
    </div>
  );
}

function FolderIcon({ isOpen }: { isOpen?: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#dcb67a"
      strokeWidth={2}
      style={{ flexShrink: 0, marginRight: 6 }}
    >
      {isOpen ? (
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      ) : (
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      )}
    </svg>
  );
}

export default function ExplorerView() {
  const { fileSystem, openTabs, activeTab, openFile, toggleFolder, closeTab, setActiveTab, addFile, addFolder, deleteNode, renameNode } = useIDEStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string; nodeType: string } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [creatingIn, setCreatingIn] = useState<{ parentPath: string; type: 'file' | 'folder' } | null>(null);
  const [createValue, setCreateValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);
  const createRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    if (creatingIn && createRef.current) {
      createRef.current.focus();
    }
  }, [creatingIn]);

  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId: string, nodeType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId, nodeType });
  }, []);

  useEffect(() => {
    function handleClick() { setContextMenu(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const flat = flattenTree(fileSystem);
  const openEditors = openTabs.map(path => {
    const found = flat.find(f => f.path === path);
    return { path, name: found?.node.name || path.split('/').pop() || path };
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Open Editors */}
      <div style={{ flexShrink: 0 }}>
        <SectionHeader title="Open Editors" defaultOpen={true}>
          {openEditors.length === 0 ? (
            <div style={{ padding: '8px 20px', color: '#6e6e6e', fontSize: 12 }}>No open editors</div>
          ) : (
            openEditors.map(({ path, name }) => (
              <div
                key={path}
                onClick={() => setActiveTab(path)}
                onMouseUp={(e) => { if (e.button === 1) { e.preventDefault(); closeTab(path); } }}
                style={{
                  height: 22,
                  padding: '0 8px 0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: activeTab === path ? '#ffffff' : '#cccccc',
                  background: activeTab === path ? '#37373d' : 'transparent',
                }}
                onMouseOver={(e) => { if (activeTab !== path) e.currentTarget.style.background = '#2a2d2e'; }}
                onMouseOut={(e) => { if (activeTab !== path) e.currentTarget.style.background = 'transparent'; }}
              >
                <FileIcon name={name} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); closeTab(path); }}
                  style={{
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0,
                    fontSize: 14,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  ×
                </span>
              </div>
            ))
          )}
        </SectionHeader>
      </div>

      {/* Workspace */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <SectionHeader title="VSCODE-WEB" defaultOpen={true}>
          {fileSystem.map(node => (
            <TreeNodeItem
              key={node.id}
              node={node}
              depth={0}
              onFileClick={openFile}
              onFolderClick={toggleFolder}
              onContextMenu={handleContextMenu}
              activeTab={activeTab}
            />
          ))}
          {creatingIn?.parentPath === 'vscode-web' && (
            <div style={{ paddingLeft: 20, height: 22, display: 'flex', alignItems: 'center' }}>
              {creatingIn.type === 'folder' ? <FolderIcon isOpen={false} /> : <FileIcon name={createValue} />}
              <input
                ref={createRef}
                value={createValue}
                onChange={(e) => setCreateValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && createValue.trim()) {
                    if (creatingIn.type === 'file') addFile('vscode-web', createValue.trim());
                    else addFolder('vscode-web', createValue.trim());
                    setCreatingIn(null);
                    setCreateValue('');
                  } else if (e.key === 'Escape') {
                    setCreatingIn(null);
                    setCreateValue('');
                  }
                }}
                onBlur={() => {
                  if (createValue.trim()) {
                    if (creatingIn.type === 'file') addFile('vscode-web', createValue.trim());
                    else addFolder('vscode-web', createValue.trim());
                  }
                  setCreatingIn(null);
                  setCreateValue('');
                }}
                style={{
                  flex: 1,
                  background: '#3c3c3c',
                  border: '1px solid #007acc',
                  color: '#cccccc',
                  fontSize: 13,
                  outline: 'none',
                  padding: '1px 4px',
                  fontFamily: 'system-ui, sans-serif',
                }}
              />
            </div>
          )}
        </SectionHeader>
      </div>

      {/* Context Menu */}
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
          {contextMenu.nodeType === 'folder' && (
            <>
              <ContextMenuItem label="New File" onClick={() => {
                const path = flat.find(f => f.node.id === contextMenu.nodeId)?.path || '';
                setCreatingIn({ parentPath: path, type: 'file' });
                setContextMenu(null);
              }} />
              <ContextMenuItem label="New Folder" onClick={() => {
                const path = flat.find(f => f.node.id === contextMenu.nodeId)?.path || '';
                setCreatingIn({ parentPath: path, type: 'folder' });
                setContextMenu(null);
              }} />
              <div style={{ height: 1, background: '#454545', margin: '4px 0' }} />
            </>
          )}
          <ContextMenuItem label="Rename" onClick={() => {
            const node = flat.find(f => f.node.id === contextMenu.nodeId);
            if (node) {
              setRenaming(contextMenu.nodeId);
              setRenameValue(node.node.name);
            }
            setContextMenu(null);
          }} />
          <ContextMenuItem label="Delete" onClick={() => {
            deleteNode(contextMenu.nodeId);
            setContextMenu(null);
          }} />
        </div>
      )}

      {/* Rename overlay */}
      {renaming && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
          }}
          onClick={() => {
            if (renameValue.trim()) renameNode(renaming, renameValue.trim());
            setRenaming(null);
          }}
        />
      )}
    </div>
  );
}

function TreeNodeItem({
  node,
  depth,
  onFileClick,
  onFolderClick,
  onContextMenu,
  activeTab,
}: {
  node: TreeNode;
  depth: number;
  onFileClick: (path: string) => void;
  onFolderClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string, type: string) => void;
  activeTab: string | null;
}) {
  const { fileSystem, dirtyTabs } = useIDEStore();
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameRef = useRef<HTMLInputElement>(null);
  const [creatingIn, setCreatingIn] = useState<'file' | 'folder' | null>(null);
  const [createValue, setCreateValue] = useState('');
  const createRef = useRef<HTMLInputElement>(null);
  const { renameNode, addFile, addFolder } = useIDEStore();

  useEffect(() => {
    if (renaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    if (creatingIn && createRef.current) {
      createRef.current.focus();
    }
  }, [creatingIn]);

  const flat = flattenTree(fileSystem);
  const nodePath = flat.find(f => f.node.id === node.id)?.path || node.name;
  const isActive = activeTab === nodePath;
  const isOpen = node.type === 'folder' && node.isOpen;
  const isDirty = node.type === 'file' && dirtyTabs.has(nodePath);

  if (renaming) {
    return (
      <div style={{ paddingLeft: 8 + depth * 20, height: 22, display: 'flex', alignItems: 'center' }}>
        {node.type === 'folder' ? <FolderIcon isOpen={false} /> : <FileIcon name={renameValue} />}
        <input
          ref={renameRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && renameValue.trim()) {
              renameNode(node.id, renameValue.trim());
              setRenaming(false);
            } else if (e.key === 'Escape') {
              setRenameValue(node.name);
              setRenaming(false);
            }
          }}
          onBlur={() => {
            if (renameValue.trim() && renameValue !== node.name) {
              renameNode(node.id, renameValue.trim());
            }
            setRenaming(false);
          }}
          style={{
            flex: 1,
            background: '#3c3c3c',
            border: '1px solid #007acc',
            color: '#cccccc',
            fontSize: 13,
            outline: 'none',
            padding: '1px 4px',
            fontFamily: 'system-ui, sans-serif',
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => {
          if (node.type === 'folder') onFolderClick(node.id);
          else onFileClick(nodePath);
        }}
        onContextMenu={(e) => onContextMenu(e, node.id, node.type)}
        style={{
          height: 22,
          paddingLeft: 8 + depth * 20,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          color: isActive ? '#ffffff' : '#cccccc',
          background: isActive ? '#37373d' : 'transparent',
        }}
        onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = '#2a2d2e'; }}
        onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        {node.type === 'folder' && (
          <span style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.1s' }}>
              <path d="M3 2L7 5L3 8" stroke="#858585" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {node.type === 'folder' ? <FolderIcon isOpen={isOpen} /> : <FileIcon language={node.language} name={node.name} />}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
          {node.name}
        </span>
        {isDirty && <span style={{ color: '#ffffff', fontSize: 10, marginLeft: 4 }}>●</span>}
      </div>

      {creatingIn && (
        <div style={{ paddingLeft: 8 + (depth + 1) * 20, height: 22, display: 'flex', alignItems: 'center' }}>
          {creatingIn === 'folder' ? <FolderIcon isOpen={false} /> : <FileIcon name={createValue} />}
          <input
            ref={createRef}
            value={createValue}
            onChange={(e) => setCreateValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && createValue.trim()) {
                if (creatingIn === 'file') addFile(nodePath, createValue.trim());
                else addFolder(nodePath, createValue.trim());
                setCreatingIn(null);
                setCreateValue('');
              } else if (e.key === 'Escape') {
                setCreatingIn(null);
                setCreateValue('');
              }
            }}
            onBlur={() => {
              if (createValue.trim()) {
                if (creatingIn === 'file') addFile(nodePath, createValue.trim());
                else addFolder(nodePath, createValue.trim());
              }
              setCreatingIn(null);
              setCreateValue('');
            }}
            style={{
              flex: 1,
              background: '#3c3c3c',
              border: '1px solid #007acc',
              color: '#cccccc',
              fontSize: 13,
              outline: 'none',
              padding: '1px 4px',
              fontFamily: 'system-ui, sans-serif',
            }}
          />
        </div>
      )}

      {node.type === 'folder' && isOpen && node.children?.map(child => (
        <TreeNodeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          onFileClick={onFileClick}
          onFolderClick={onFolderClick}
          onContextMenu={onContextMenu}
          activeTab={activeTab}
        />
      ))}
    </div>
  );
}

function SectionHeader({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: 22,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          color: '#bbbbbb',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.1s' }}>
          <path d="M3 2L7 5L3 8" stroke="#858585" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </div>
      {isOpen && children}
    </div>
  );
}

function ContextMenuItem({ label, onClick, shortcut }: { label: string; onClick: () => void; shortcut?: string }) {
  return (
    <div
      onClick={onClick}
      style={{
        height: 28,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        color: '#cccccc',
        fontSize: 13,
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = '#094771'; }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{label}</span>
      {shortcut && <span style={{ color: '#6e6e6e', fontSize: 12 }}>{shortcut}</span>}
    </div>
  );
}
