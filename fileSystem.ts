import type { TreeNode } from '@/types';

let idCounter = 0;
export function genId(): string {
  return `node_${++idCounter}_${Date.now()}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

export function findNodeByPath(tree: TreeNode[], path: string): TreeNode | null {
  for (const node of tree) {
    const nodePath = getNodePath(tree, node.id);
    if (nodePath === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function getNodePath(tree: TreeNode[], nodeId: string, parentPath = ''): string | null {
  for (const node of tree) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.id === nodeId) return currentPath;
    if (node.children) {
      const found = getNodePath(node.children, nodeId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function getParentPath(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
}

export function getFileName(path: string): string {
  return path.split('/').pop() || '';
}

export function getLanguageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    md: 'markdown',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
    dockerfile: 'dockerfile',
    vue: 'html',
    svelte: 'html',
    dart: 'dart',
    lua: 'lua',
    r: 'r',
  };
  return map[ext] || 'plaintext';
}

export function getDefaultWorkspace(): TreeNode[] {
  resetIdCounter();
  return [
    {
      id: genId(),
      name: 'vscode-web',
      type: 'folder',
      isOpen: true,
      children: [
        {
          id: genId(),
          name: 'src',
          type: 'folder',
          isOpen: true,
          children: [
            {
              id: genId(),
              name: 'components',
              type: 'folder',
              isOpen: false,
              children: [
                { id: genId(), name: 'Button.tsx', type: 'file', language: 'typescript' },
                { id: genId(), name: 'Modal.tsx', type: 'file', language: 'typescript' },
                { id: genId(), name: 'styles.css', type: 'file', language: 'css' },
              ],
            },
            {
              id: genId(),
              name: 'utils',
              type: 'folder',
              isOpen: false,
              children: [
                { id: genId(), name: 'helpers.ts', type: 'file', language: 'typescript' },
                { id: genId(), name: 'constants.ts', type: 'file', language: 'typescript' },
              ],
            },
            { id: genId(), name: 'App.tsx', type: 'file', language: 'typescript' },
            { id: genId(), name: 'index.ts', type: 'file', language: 'typescript' },
            { id: genId(), name: 'types.ts', type: 'file', language: 'typescript' },
          ],
        },
        {
          id: genId(),
          name: 'public',
          type: 'folder',
          isOpen: false,
          children: [
            { id: genId(), name: 'index.html', type: 'file', language: 'html' },
            { id: genId(), name: 'favicon.ico', type: 'file', language: 'plaintext' },
          ],
        },
        {
          id: genId(),
          name: 'tests',
          type: 'folder',
          isOpen: false,
          children: [
            { id: genId(), name: 'App.test.tsx', type: 'file', language: 'typescript' },
            { id: genId(), name: 'setup.ts', type: 'file', language: 'typescript' },
          ],
        },
        { id: genId(), name: 'package.json', type: 'file', language: 'json' },
        { id: genId(), name: 'tsconfig.json', type: 'file', language: 'json' },
        { id: genId(), name: 'README.md', type: 'file', language: 'markdown' },
        { id: genId(), name: '.gitignore', type: 'file', language: 'plaintext' },
        { id: genId(), name: 'vite.config.ts', type: 'file', language: 'typescript' },
        { id: genId(), name: 'Dockerfile', type: 'file', language: 'dockerfile' },
      ],
    },
  ];
}

export function getDefaultFileContents(): Record<string, { content: string; language: string }> {
  return {
    'vscode-web/src/App.tsx': {
      language: 'typescript',
      content: `import React, { useState } from 'react';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { formatDate } from './utils/helpers';

interface AppProps {
  title: string;
}

const App: React.FC<AppProps> = ({ title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{title}</h1>
        <p>Today is {formatDate(new Date())}</p>
      </header>
      
      <main className="app-main">
        <div className="counter-section">
          <p>Count: {count}</p>
          <Button onClick={handleIncrement} variant="primary">
            Increment
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            Open Modal
          </Button>
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Welcome"
      >
        <p>This is a sample modal component.</p>
      </Modal>
    </div>
  );
};

export default App;`,
    },
    'vscode-web/src/index.ts': {
      language: 'typescript',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App title="My Awesome App" />
  </React.StrictMode>
);`,
    },
    'vscode-web/src/types.ts': {
      language: 'typescript',
      content: `export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppConfig {
  theme: Theme;
  apiUrl: string;
  features: {
    darkMode: boolean;
    notifications: boolean;
    analytics: boolean;
  };
}`,
    },
    'vscode-web/src/components/Button.tsx': {
      language: 'typescript',
      content: `import React from 'react';
import './styles.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={\`btn btn--\${variant}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};`,
    },
    'vscode-web/src/components/Modal.tsx': {
      language: 'typescript',
      content: `import React, { useEffect } from 'react';
import './styles.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};`,
    },
    'vscode-web/src/components/styles.css': {
      language: 'css',
      content: `.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn--primary {
  background-color: #007acc;
  color: white;
}

.btn--primary:hover {
  background-color: #005f9e;
}

.btn--secondary {
  background-color: #3c3c3c;
  color: #cccccc;
}

.btn--secondary:hover {
  background-color: #505050;
}

.btn--danger {
  background-color: #f44336;
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #252526;
  border: 1px solid #454545;
  border-radius: 6px;
  min-width: 400px;
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #454545;
}

.modal-close {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
  color: #cccccc;
}`,
    },
    'vscode-web/src/utils/helpers.ts': {
      language: 'typescript',
      content: `export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}`,
    },
    'vscode-web/src/utils/constants.ts': {
      language: 'typescript',
      content: `export const APP_NAME = 'VS Code Web';
export const APP_VERSION = '1.0.0';

export const DEFAULT_THEME = 'dark';

export const API_ENDPOINTS = {
  USERS: '/api/users',
  POSTS: '/api/posts',
  AUTH: '/api/auth',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB`,
    },
    'vscode-web/package.json': {
      language: 'json',
      content: `{
  "name": "vscode-web",
  "version": "1.0.0",
  "description": "A VS Code-like web IDE",
  "main": "src/index.ts",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.55.0"
  }
}`,
    },
    'vscode-web/tsconfig.json': {
      language: 'json',
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    },
    'vscode-web/README.md': {
      language: 'markdown',
      content: `# VS Code Web

A browser-based IDE inspired by Visual Studio Code.

## Features

- Multi-tab code editor with syntax highlighting
- File explorer with create, rename, and delete operations
- Integrated terminal with command support
- Extension marketplace
- Dark theme support

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linter

## Tech Stack

- React 18
- TypeScript
- Vite
- Zustand (state management)

## License

MIT`,
    },
    'vscode-web/public/index.html': {
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VS Code Web</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.ts"></script>
  </body>
</html>`,
    },
    'vscode-web/.gitignore': {
      language: 'plaintext',
      content: `node_modules/
dist/
*.log
.env
.env.local
.DS_Store
coverage/
*.tsbuildinfo`,
    },
    'vscode-web/vite.config.ts': {
      language: 'typescript',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});`,
    },
    'vscode-web/Dockerfile': {
      language: 'dockerfile',
      content: `FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`,
    },
    'vscode-web/tests/App.test.tsx': {
      language: 'typescript',
      content: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App title="Test App" />);
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('renders counter section', () => {
    render(<App title="Test App" />);
    expect(screen.getByText(/count/i)).toBeInTheDocument();
  });
});`,
    },
    'vscode-web/tests/setup.ts': {
      language: 'typescript',
      content: `import '@testing-library/jest-dom';

// Global test setup
globalThis.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});`,
    },
  };
}

export function flattenTree(tree: TreeNode[], parentPath = ''): { path: string; node: TreeNode }[] {
  const result: { path: string; node: TreeNode }[] = [];
  for (const node of tree) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    result.push({ path: currentPath, node });
    if (node.children) {
      result.push(...flattenTree(node.children, currentPath));
    }
  }
  return result;
}

export function addNodeToTree(tree: TreeNode[], parentPath: string, newNode: TreeNode): boolean {
  for (const node of tree) {
    const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (fullPath === parentPath && node.type === 'folder') {
      if (!node.children) node.children = [];
      node.children.push(newNode);
      node.isOpen = true;
      return true;
    }
    if (node.children && addNodeToTree(node.children, fullPath, newNode)) {
      return true;
    }
  }
  return false;
}

export function removeNodeFromTree(tree: TreeNode[], nodeId: string): TreeNode[] {
  return tree.filter(n => n.id !== nodeId).map(n => {
    if (n.children) {
      return { ...n, children: removeNodeFromTree(n.children, nodeId) };
    }
    return n;
  });
}

export function renameNodeInTree(tree: TreeNode[], nodeId: string, newName: string): TreeNode[] {
  return tree.map(n => {
    if (n.id === nodeId) {
      return { ...n, name: newName };
    }
    if (n.children) {
      return { ...n, children: renameNodeInTree(n.children, nodeId, newName) };
    }
    return n;
  });
}

export function toggleFolderOpen(tree: TreeNode[], nodeId: string): TreeNode[] {
  return tree.map(n => {
    if (n.id === nodeId && n.type === 'folder') {
      return { ...n, isOpen: !n.isOpen };
    }
    if (n.children) {
      return { ...n, children: toggleFolderOpen(n.children, nodeId) };
    }
    return n;
  });
}
