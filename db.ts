import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TreeNode, Extension } from '@/types';

interface VSCodeDB extends DBSchema {
  files: {
    key: string;
    value: { path: string; content: string; language: string };
  };
  fileSystem: {
    key: string;
    value: { tree: TreeNode[]; id: string };
  };
  settings: {
    key: string;
    value: {
      openTabs: string[];
      activeTab: string | null;
      activeView: string;
      sidebarVisible: boolean;
      panelVisible: boolean;
      panelActiveTab: string;
      installedExtensions: Extension[];
      commandHistory: string[];
      sidebarWidth: number;
      panelHeight: number;
      key: string;
    };
  };
}

let db: IDBPDatabase<VSCodeDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<VSCodeDB>> {
  if (db) return db;
  db = await openDB<VSCodeDB>('vscode-web-store', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains('fileSystem')) {
        db.createObjectStore('fileSystem', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
  return db;
}

export async function saveFile(path: string, content: string, language: string): Promise<void> {
  const database = await initDB();
  await database.put('files', { path, content, language });
}

export async function getFile(path: string): Promise<{ path: string; content: string; language: string } | undefined> {
  const database = await initDB();
  return database.get('files', path);
}

export async function deleteFile(path: string): Promise<void> {
  const database = await initDB();
  await database.delete('files', path);
}

export async function getAllFiles(): Promise<Record<string, { content: string; language: string }>> {
  const database = await initDB();
  const all = await database.getAll('files');
  const result: Record<string, { content: string; language: string }> = {};
  for (const f of all) {
    result[f.path] = { content: f.content, language: f.language };
  }
  return result;
}

export async function saveFileSystem(tree: TreeNode[]): Promise<void> {
  const database = await initDB();
  await database.put('fileSystem', { tree, id: 'main' });
}

export async function getFileSystem(): Promise<TreeNode[] | null> {
  const database = await initDB();
  const result = await database.get('fileSystem', 'main');
  return result?.tree ?? null;
}

export async function saveSettings(settings: {
  openTabs: string[];
  activeTab: string | null;
  activeView: string;
  sidebarVisible: boolean;
  panelVisible: boolean;
  panelActiveTab: string;
  installedExtensions: Extension[];
  commandHistory: string[];
  sidebarWidth: number;
  panelHeight: number;
}): Promise<void> {
  const database = await initDB();
  await database.put('settings', { ...settings, key: 'main' });
}

export async function getSettings() {
  const database = await initDB();
  return database.get('settings', 'main');
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function debouncedSave(callback: () => void, delay = 500): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(callback, delay);
}
