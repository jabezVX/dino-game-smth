import { create } from 'zustand';
import type { TreeNode, Extension, SidebarView, PanelTab } from '@/types';
import {
  getDefaultWorkspace,
  getDefaultFileContents,
  getLanguageFromFileName,
  addNodeToTree,
  removeNodeFromTree,
  renameNodeInTree,
  toggleFolderOpen,
  flattenTree,
  genId,
} from '@/lib/fileSystem';
import {
  saveFile,
  deleteFile,
  saveFileSystem,
  saveSettings,
  getSettings,
  getAllFiles,
  getFileSystem,
  debouncedSave,
} from '@/lib/db';

interface IDEState {
  // Files
  files: Record<string, { content: string; language: string }>;
  fileSystem: TreeNode[];

  // Editor
  openTabs: string[];
  activeTab: string | null;
  untitledCount: number;

  // UI
  activeView: SidebarView;
  sidebarVisible: boolean;
  panelVisible: boolean;
  panelActiveTab: PanelTab;
  activeMenu: string | null;
  sidebarWidth: number;
  panelHeight: number;

  // Terminal
  commandHistory: string[];
  claudeMode: boolean;

  // Extensions
  installedExtensions: Extension[];

  // Command palette
  commandPaletteOpen: boolean;

  // Context menu
  contextMenu: { x: number; y: number; items: { label: string; action: () => void; shortcut?: string; separator?: boolean }[] } | null;

  // Actions
  setActiveView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  togglePanel: () => void;
  setPanelActiveTab: (tab: PanelTab) => void;
  setActiveMenu: (menu: string | null) => void;
  setSidebarWidth: (w: number) => void;
  setPanelHeight: (h: number) => void;

  // Editor actions
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (path: string) => void;
  closeTabsToRight: (path: string) => void;
  newUntitledFile: () => string;
  markDirty: (path: string, dirty: boolean) => void;
  saveFileContent: (path: string, content: string) => void;

  // File system actions
  toggleFolder: (nodeId: string) => void;
  addFile: (parentPath: string, name: string) => void;
  addFolder: (parentPath: string, name: string) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;

  // Terminal actions
  addCommandHistory: (cmd: string) => void;
  setClaudeMode: (mode: boolean) => void;
  clearCommandHistory: () => void;

  // Extension actions
  installExtension: (ext: Extension) => void;
  uninstallExtension: (extId: string) => void;

  // Command palette
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // Context menu
  showContextMenu: (x: number, y: number, items: { label: string; action: () => void; shortcut?: string; separator?: boolean }[]) => void;
  hideContextMenu: () => void;

  // Init
  initialize: () => Promise<void>;

  // Tab dirty tracking
  dirtyTabs: Set<string>;
}

const DEFAULT_EXTENSIONS: Extension[] = [
  { id: 'eslint', name: 'ESLint', description: 'Integrates ESLint JavaScript', author: 'Microsoft', version: '2.4.4', icon: '🔧', installs: '52M', rating: 4.5, installed: true, categories: ['installed'] },
  { id: 'prettier', name: 'Prettier - Code: formatter', description: 'Code: formatter using prettier', author: 'Prettier', version: '10.1.0', icon: '✨', installs: '48M', rating: 4.7, installed: true, categories: ['installed'] },
  { id: 'python', name: 'Python', description: 'IntelliSense, linting, debugging', author: 'Microsoft', version: '2024.2.1', icon: '🐍', installs: '98M', rating: 4.6, installed: true, categories: ['installed'] },
  { id: 'gitlens', name: 'GitLens', description: 'Supercharge Git within VS Code:', author: 'GitKraken', version: '14.8.0', icon: '🔀', installs: '36M', rating: 4.8, installed: false, categories: ['popular'] },
  { id: 'live-server', name: 'Live Server', description: 'Launch a development server', author: 'Ritwick Dey', version: '5.7.9', icon: '🌐', installs: '42M', rating: 4.5, installed: false, categories: ['popular'] },
  { id: 'docker', name: 'Docker', description: 'Makes it easy to create, manage', author: 'Microsoft', version: '1.29.0', icon: '🐳', installs: '28M', rating: 4.4, installed: false, categories: ['popular'] },
  { id: 'tailwind', name: 'Tailwind CSS: IntelliSense', description: 'Intelligent Tailwind CSS: tooling', author: 'Tailwind Labs', version: '0.10.5', icon: '🎨', installs: '12M', rating: 4.7, installed: false, categories: ['recommended'] },
  { id: 'vim', name: 'Vim', description: 'Vim emulation for Visual Studio Code:', author: 'vscodevim', version: '1.27.2', icon: '📟', installs: '8M', rating: 4.3, installed: false, categories: ['recommended'] },
  { id: 'rust-analyzer', name: 'rust-analyzer', description: 'Rust language support', author: 'rust-lang', version: '0.4.0', icon: '🦀', installs: '3M', rating: 4.8, installed: false, categories: ['recommended'] },
];

export const useIDEStore = create<IDEState>((set, get) => ({
  files: {},
  fileSystem: [],
  openTabs: [],
  activeTab: null,
  untitledCount: 0,
  activeView: 'explorer',
  sidebarVisible: true,
  panelVisible: true,
  panelActiveTab: 'terminal',
  activeMenu: null,
  sidebarWidth: 250,
  panelHeight: 200,
  commandHistory: [],
  claudeMode: false,
  installedExtensions: DEFAULT_EXTENSIONS,
  commandPaletteOpen: false,
  contextMenu: null,
  dirtyTabs: new Set(),

  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set(s => ({ sidebarVisible: !s.sidebarVisible })),
  togglePanel: () => set(s => ({ panelVisible: !s.panelVisible })),
  setPanelActiveTab: (tab) => set({ panelActiveTab: tab }),
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setSidebarWidth: (w) => set({ sidebarWidth: w }),
  setPanelHeight: (h) => set({ panelHeight: h }),

  openFile: (path) => {
    const s = get();
    if (!s.openTabs.includes(path)) {
      const newTabs = [...s.openTabs, path];
      set({ openTabs: newTabs, activeTab: path });
    } else {
      set({ activeTab: path });
    }
    persistState(get());
  },

  closeTab: (path) => {
    const s = get();
    const newTabs = s.openTabs.filter(t => t !== path);
    const newDirty = new Set(s.dirtyTabs);
    newDirty.delete(path);
    let newActive = s.activeTab;
    if (s.activeTab === path) {
      const idx = s.openTabs.indexOf(path);
      newActive = newTabs[idx] || newTabs[idx - 1] || null;
    }
    set({ openTabs: newTabs, activeTab: newActive, dirtyTabs: newDirty });
    persistState(get());
  },

  setActiveTab: (path) => set({ activeTab: path }),

  closeAllTabs: () => {
    set({ openTabs: [], activeTab: null, dirtyTabs: new Set() });
    persistState(get());
  },

  closeOtherTabs: (path) => {
    const s = get();
    const newDirty = new Set<string>();
    if (s.dirtyTabs.has(path)) newDirty.add(path);
    set({ openTabs: [path], activeTab: path, dirtyTabs: newDirty });
    persistState(get());
  },

  closeTabsToRight: (path) => {
    const s = get();
    const idx = s.openTabs.indexOf(path);
    const newTabs = s.openTabs.slice(0, idx + 1);
    const newDirty = new Set(s.dirtyTabs);
    for (const dt of s.dirtyTabs) {
      if (!newTabs.includes(dt)) newDirty.delete(dt);
    }
    set({ openTabs: newTabs, dirtyTabs: newDirty });
    persistState(get());
  },

  newUntitledFile: () => {
    const s = get();
    const count = s.untitledCount + 1;
    const path = `Untitled-${count}`;
    const newFiles = { ...s.files, [path]: { content: '', language: 'plaintext' } };
    const newTabs = [...s.openTabs, path];
    set({ files: newFiles, openTabs: newTabs, activeTab: path, untitledCount: count, dirtyTabs: new Set(s.dirtyTabs).add(path) });
    persistState(get());
    return path;
  },

  markDirty: (path, dirty) => {
    const s = get();
    const newDirty = new Set(s.dirtyTabs);
    if (dirty) newDirty.add(path);
    else newDirty.delete(path);
    set({ dirtyTabs: newDirty });
  },

  saveFileContent: (path, content) => {
    const s = get();
    const lang = getLanguageFromFileName(path);
    const newFiles = { ...s.files, [path]: { content, language: lang } };
    const newDirty = new Set(s.dirtyTabs);
    newDirty.delete(path);
    set({ files: newFiles, dirtyTabs: newDirty });
    debouncedSave(async () => {
      await saveFile(path, content, lang);
    }, 300);
  },

  toggleFolder: (nodeId) => {
    const s = get();
    const newFs = toggleFolderOpen(s.fileSystem, nodeId);
    set({ fileSystem: newFs });
    persistFileSystem(newFs);
  },

  addFile: (parentPath, name) => {
    const s = get();
    const newNode: TreeNode = { id: genId(), name, type: 'file', language: getLanguageFromFileName(name) };
    const newFs = [...s.fileSystem];
    if (addNodeToTree(newFs, parentPath, newNode)) {
      const path = parentPath ? `${parentPath}/${name}` : name;
      const newFiles = { ...s.files, [path]: { content: '', language: getLanguageFromFileName(name) } };
      set({ fileSystem: newFs, files: newFiles });
      persistFileSystem(newFs);
      saveFile(path, '', getLanguageFromFileName(name));
    }
  },

  addFolder: (parentPath, name) => {
    const s = get();
    const newNode: TreeNode = { id: genId(), name, type: 'folder', isOpen: false, children: [] };
    const newFs = [...s.fileSystem];
    if (addNodeToTree(newFs, parentPath, newNode)) {
      set({ fileSystem: newFs });
      persistFileSystem(newFs);
    }
  },

  deleteNode: (nodeId) => {
    const s = get();
    // Find path to delete from files
    const flat = flattenTree(s.fileSystem);
    const toDelete = flat.filter(f => {
      if (f.node.id === nodeId) return true;
      // Also delete children
      const parentIds = new Set<string>();
      const collectParent = (tree: TreeNode[], targetId: string): boolean => {
        for (const n of tree) {
          if (n.id === targetId) return true;
          if (n.children && collectParent(n.children, targetId)) {
            parentIds.add(n.id);
            return true;
          }
        }
        return false;
      };
      return collectParent(s.fileSystem, nodeId);
    });
    
    const newFs = removeNodeFromTree(s.fileSystem, nodeId);
    const newFiles = { ...s.files };
    const newTabs = [...s.openTabs];
    const newDirty = new Set(s.dirtyTabs);
    
    for (const { path } of toDelete) {
      if (newFiles[path]) {
        delete newFiles[path];
        deleteFile(path);
      }
      const tabIdx = newTabs.indexOf(path);
      if (tabIdx !== -1) {
        newTabs.splice(tabIdx, 1);
        newDirty.delete(path);
      }
    }
    
    set({
      fileSystem: newFs,
      files: newFiles,
      openTabs: newTabs,
      dirtyTabs: newDirty,
      activeTab: newTabs.includes(s.activeTab || '') ? s.activeTab : newTabs[0] || null,
    });
    persistFileSystem(newFs);
    persistState(get());
  },

  renameNode: (nodeId, newName) => {
    const s = get();
    const newFs = renameNodeInTree(s.fileSystem, nodeId, newName);
    set({ fileSystem: newFs });
    persistFileSystem(newFs);
  },

  addCommandHistory: (cmd) => {
    const s = get();
    const newHistory = [...s.commandHistory, cmd];
    set({ commandHistory: newHistory });
    debouncedSave(() => saveSettings(extractSettings(get())), 500);
  },

  setClaudeMode: (mode) => set({ claudeMode: mode }),
  clearCommandHistory: () => set({ commandHistory: [] }),

  installExtension: (ext) => {
    const s = get();
    const newExts = s.installedExtensions.map(e =>
      e.id === ext.id ? { ...e, installed: true } : e
    );
    set({ installedExtensions: newExts });
    persistState(get());
  },

  uninstallExtension: (extId) => {
    const s = get();
    const newExts = s.installedExtensions.map(e =>
      e.id === extId ? { ...e, installed: false } : e
    );
    set({ installedExtensions: newExts });
    persistState(get());
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  showContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
  hideContextMenu: () => set({ contextMenu: null }),

  initialize: async () => {
    const storedFs = await getFileSystem();
    const storedFiles = await getAllFiles();
    const storedSettings = await getSettings();

    const fileSystem = storedFs && storedFs.length > 0 ? storedFs : getDefaultWorkspace();
    const files = Object.keys(storedFiles).length > 0 ? storedFiles : getDefaultFileContents();

    set({
      fileSystem,
      files,
      openTabs: storedSettings?.openTabs || ['vscode-web/src/App.tsx'],
      activeTab: storedSettings?.activeTab || 'vscode-web/src/App.tsx',
      activeView: (storedSettings?.activeView as SidebarView) || 'explorer',
      sidebarVisible: storedSettings?.sidebarVisible ?? true,
      panelVisible: storedSettings?.panelVisible ?? true,
      panelActiveTab: (storedSettings?.panelActiveTab as PanelTab) || 'terminal',
      installedExtensions: storedSettings?.installedExtensions || DEFAULT_EXTENSIONS,
      commandHistory: storedSettings?.commandHistory || [],
      sidebarWidth: storedSettings?.sidebarWidth || 250,
      panelHeight: storedSettings?.panelHeight || 200,
    });
  },
}));

function extractSettings(state: IDEState) {
  return {
    openTabs: state.openTabs,
    activeTab: state.activeTab,
    activeView: state.activeView,
    sidebarVisible: state.sidebarVisible,
    panelVisible: state.panelVisible,
    panelActiveTab: state.panelActiveTab,
    installedExtensions: state.installedExtensions,
    commandHistory: state.commandHistory,
    sidebarWidth: state.sidebarWidth,
    panelHeight: state.panelHeight,
  };
}

function persistState(state: IDEState) {
  debouncedSave(() => saveSettings(extractSettings(state)), 500);
}

function persistFileSystem(tree: TreeNode[]) {
  debouncedSave(() => saveFileSystem(tree), 500);
}
