export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  isOpen?: boolean;
  language?: string;
}

export interface FileRecord {
  path: string;
  content: string;
  language: string;
}

export interface Tab {
  path: string;
  isDirty: boolean;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  icon: string;
  installs: string;
  rating: number;
  installed: boolean;
  categories: string[];
}

export interface MenuItem {
  label: string;
  shortcut?: string;
  action?: string;
  separator?: boolean;
  submenu?: MenuItem[];
  checkbox?: boolean;
  checked?: boolean;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
}

export interface SearchResult {
  file: string;
  line: number;
  preview: string;
  matches: { start: number; end: number }[];
}

export type SidebarView = 'explorer' | 'search' | 'scm' | 'debug' | 'extensions';
export type PanelTab = 'terminal' | 'output' | 'problems' | 'debug-console';
