import type { TreeNode } from '@/types';
import { findNodeByPath } from './fileSystem';

export interface TerminalContext {
  cwd: string;
  fileSystem: TreeNode[];
  files: Record<string, { content: string; language: string }>;
  claudeMode: boolean;
  commandHistory: string[];
}

export interface CommandResult {
  output: string;
  error?: boolean;
  newCwd?: string;
  claudeMode?: boolean;
}

const COLORS = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function resolvePath(cwd: string, path: string): string {
  if (path.startsWith('/')) return path;
  if (path === '~') return 'vscode-web';
  const parts = cwd.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  for (const part of pathParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }
  return parts.join('/') || 'vscode-web';
}

function getNodeAtPath(tree: TreeNode[], path: string): TreeNode | null {
  return findNodeByPath(tree, path);
}

function getChildrenAtPath(tree: TreeNode[], path: string): TreeNode[] {
  const node = getNodeAtPath(tree, path);
  if (node && node.type === 'folder' && node.children) {
    return node.children;
  }
  // Check root level
  if (path === 'vscode-web' || path === '') {
    return tree;
  }
  return [];
}

export function executeCommand(
  input: string,
  ctx: TerminalContext
): CommandResult {
  const args = input.trim().split(/\s+/);
  const command = args[0];
  const rest = args.slice(1);

  switch (command) {
    case 'ls':
      return cmdLs(rest, ctx);
    case 'cd':
      return cmdCd(rest, ctx);
    case 'pwd':
      return cmdPwd(ctx);
    case 'cat':
      return cmdCat(rest, ctx);
    case 'echo':
      return cmdEcho(rest, ctx);
    case 'mkdir':
      return cmdMkdir(rest, ctx);
    case 'touch':
      return cmdTouch(rest, ctx);
    case 'rm':
      return cmdRm(rest, ctx);
    case 'clear':
      return { output: '__CLEAR__' };
    case 'help':
      return cmdHelp();
    case 'whoami':
      return { output: 'developer' };
    case 'date':
      return { output: new Date().toString() };
    case 'claude':
      return { output: `${COLORS.yellow}Entering Claude Code REPL...${COLORS.reset}\nType /help for available commands, /exit to quit.`, claudeMode: true };
    case '':
      return { output: '' };
    default:
      return { output: `${COLORS.red}Command not found: ${command}${COLORS.reset}\nType 'help' for available commands.`, error: true };
  }
}

function cmdLs(args: string[], ctx: TerminalContext): CommandResult {
  const path = resolvePath(ctx.cwd, args[0] || '.');
  const children = getChildrenAtPath(ctx.fileSystem, path);

  if (children.length === 0) {
    return { output: '' };
  }

  const dirs: string[] = [];
  const files: string[] = [];

  for (const child of children) {
    if (child.type === 'folder') {
      dirs.push(`${COLORS.blue}${COLORS.bold}${child.name}/${COLORS.reset}`);
    } else {
      const ext = child.name.split('.').pop() || '';
      let color = COLORS.reset;
      if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) color = COLORS.yellow;
      else if (['json'].includes(ext)) color = COLORS.yellow;
      else if (['css', 'scss', 'less'].includes(ext)) color = COLORS.cyan;
      else if (['md'].includes(ext)) color = COLORS.magenta;
      else if (['html', 'htm', 'xml'].includes(ext)) color = COLORS.red;
      files.push(`${color}${child.name}${COLORS.reset}`);
    }
  }

  return { output: [...dirs, ...files].join('  ') };
}

function cmdCd(args: string[], ctx: TerminalContext): CommandResult {
  if (!args[0] || args[0] === '~') {
    return { output: '', newCwd: 'vscode-web' };
  }
  const newPath = resolvePath(ctx.cwd, args[0]);
  const node = getNodeAtPath(ctx.fileSystem, newPath);
  if (!node) {
    return { output: `${COLORS.red}cd: no such file or directory: ${args[0]}${COLORS.reset}`, error: true };
  }
  if (node.type !== 'folder') {
    return { output: `${COLORS.red}cd: not a directory: ${args[0]}${COLORS.reset}`, error: true };
  }
  return { output: '', newCwd: newPath };
}

function cmdPwd(ctx: TerminalContext): CommandResult {
  return { output: `/${ctx.cwd}` };
}

function cmdCat(args: string[], ctx: TerminalContext): CommandResult {
  if (!args[0]) {
    return { output: `${COLORS.red}cat: missing file operand${COLORS.reset}`, error: true };
  }
  const path = resolvePath(ctx.cwd, args[0]);
  const file = ctx.files[path];
  if (file) {
    return { output: file.content };
  }
  const node = getNodeAtPath(ctx.fileSystem, path);
  if (!node) {
    return { output: `${COLORS.red}cat: ${args[0]}: No such file${COLORS.reset}`, error: true };
  }
  if (node.type === 'folder') {
    return { output: `${COLORS.red}cat: ${args[0]}: Is a directory${COLORS.reset}`, error: true };
  }
  return { output: '' };
}

function cmdEcho(args: string[], _ctx: TerminalContext): CommandResult {
  return { output: args.join(' ') };
}

function cmdMkdir(args: string[], ctx: TerminalContext): CommandResult {
  if (!args[0]) {
    return { output: `${COLORS.red}mkdir: missing operand${COLORS.reset}`, error: true };
  }
  const name = args[0];
  const parentPath = ctx.cwd;
  const children = getChildrenAtPath(ctx.fileSystem, parentPath);
  if (children.some(c => c.name === name)) {
    return { output: `${COLORS.red}mkdir: cannot create directory '${name}': File exists${COLORS.reset}`, error: true };
  }
  // We can't actually mutate the tree from here - return instruction
  return { output: `${COLORS.green}Created directory: ${name}/${COLORS.reset}` };
}

function cmdTouch(args: string[], ctx: TerminalContext): CommandResult {
  if (!args[0]) {
    return { output: `${COLORS.red}touch: missing file operand${COLORS.reset}`, error: true };
  }
  const name = args[0];
  const parentPath = ctx.cwd;
  const children = getChildrenAtPath(ctx.fileSystem, parentPath);
  if (children.some(c => c.name === name)) {
    return { output: `${COLORS.yellow}File '${name}' already exists${COLORS.reset}` };
  }
  return { output: `${COLORS.green}Created file: ${name}${COLORS.reset}` };
}

function cmdRm(args: string[], ctx: TerminalContext): CommandResult {
  if (!args[0]) {
    return { output: `${COLORS.red}rm: missing operand${COLORS.reset}`, error: true };
  }
  const name = args[0];
  const path = resolvePath(ctx.cwd, name);
  const node = getNodeAtPath(ctx.fileSystem, path);
  if (!node) {
    return { output: `${COLORS.red}rm: cannot remove '${name}': No such file${COLORS.reset}`, error: true };
  }
  return { output: `${COLORS.green}Removed: ${name}${COLORS.reset}` };
}

function cmdHelp(): CommandResult {
  const commands = [
    ['ls [path]', 'List directory contents'],
    ['cd <path>', 'Change directory'],
    ['pwd', 'Print working directory'],
    ['cat <file>', 'Display file contents'],
    ['echo <text>', 'Print text'],
    ['mkdir <name>', 'Create directory'],
    ['touch <name>', 'Create empty file'],
    ['rm <name>', 'Remove file or directory'],
    ['clear', 'Clear terminal screen'],
    ['whoami', 'Print current user'],
    ['date', 'Print current date and time'],
    ['claude', 'Enter Claude Code REPL'],
    ['help', 'Show this help message'],
  ];

  let output = `${COLORS.bold}${COLORS.cyan}Available Commands:${COLORS.reset}\n\n`;
  const maxLen = Math.max(...commands.map(c => c[0].length));
  for (const [cmd, desc] of commands) {
    output += `  ${COLORS.yellow}${cmd.padEnd(maxLen + 2)}${COLORS.reset}${desc}\n`;
  }
  output += `\n${COLORS.gray}Tip: Type 'claude' to enter the Claude Code REPL.${COLORS.reset}`;
  return { output };
}

// Claude REPL responses
const CLAUDE_RESPONSES: Record<string, string> = {
  'hello': 'Hello! I\'m Claude, your AI coding assistant. How can I help you today?',
  'hi': 'Hi there! What would you like to work on?',
  'help': 'I can help you with:\n- Writing and debugging code\n- Explaining concepts\n- Reviewing your code\n- Suggesting improvements\n- Answering questions\n\nJust ask me anything!',
  'default': 'That\'s an interesting question. In a full Claude Code integration, I would analyze your codebase and provide context-aware assistance. For now, try asking about specific programming topics!',
  'react': 'React is a declarative JavaScript library for building user interfaces. Key concepts:\n\n1. **Components**: Reusable UI building blocks\n2. **Props**: Data passed to components\n3. **State**: Internal component data that triggers re-renders\n4. **Hooks**: Functions like useState, useEffect for state and side effects\n5. **JSX**: Syntax extension for JavaScript that looks like HTML\n\nWould you like me to explain any of these in more detail?',
  'typescript': 'TypeScript adds static type checking to JavaScript. Benefits:\n\n- Catch errors at compile time\n- Better IDE support (autocomplete, refactoring)\n- Self-documenting code\n- Easier collaboration\n\nKey features: interfaces, generics, type inference, union types, and decorators.',
  'css': 'CSS (Cascading Style Sheets) controls the visual presentation of web pages. Modern CSS includes:\n\n- Flexbox and Grid for layouts\n- CSS Variables for theming\n- Media queries for responsive design\n- Animations and transitions\n- Container queries\n\nWould you like tips on any specific CSS technique?',
  'debug': 'Here are some debugging strategies:\n\n1. **Console logging**: Use console.log, console.table, console.dir\n2. **Debugger statement**: Insert `debugger;` to set breakpoints\n3. **Browser DevTools**: Use Sources panel for step-through debugging\n4. **React DevTools**: Inspect component hierarchy and props\n5. **Linting**: Enable ESLint to catch common errors early\n\nWhat specific issue are you debugging?',
  'git': 'Common Git workflows:\n\n```bash\ngit status          # Check current state\ngit add .           # Stage changes\ngit commit -m "msg" # Commit with message\ngit push            # Push to remote\ngit pull            # Pull latest changes\ngit branch          # List branches\ngit checkout -b x   # Create and switch branch\ngit log --oneline   # View commit history\n```\n\nNeed help with a specific git operation?',
};

export function getClaudeResponse(input: string): { text: string; toolCall?: { name: string; params: Record<string, string> } } {
  const lower = input.toLowerCase().trim();

  if (lower === '/help') {
    return { text: `${COLORS.cyan}Claude Code REPL Commands:${COLORS.reset}\n  /help   - Show this help\n  /clear  - Clear conversation\n  /exit   - Exit REPL mode` };
  }
  if (lower === '/clear') {
    return { text: '__CLEAR__' };
  }
  if (lower === '/exit') {
    return { text: '__EXIT__' };
  }

  // Check for keyword matches
  for (const [key, response] of Object.entries(CLAUDE_RESPONSES)) {
    if (lower.includes(key)) {
      return { text: response };
    }
  }

  // Simulate tool call for certain queries
  if (lower.includes('file') || lower.includes('read') || lower.includes('code')) {
    return {
      text: 'Let me check the relevant files for you.',
      toolCall: {
        name: 'read_file',
        params: { file_path: 'src/App.tsx' },
      },
    };
  }

  return { text: CLAUDE_RESPONSES['default'] };
}

export function formatToolCall(name: string, params: Record<string, string>): string {
  let output = `\n${COLORS.gray}┌─────────────────────────────${COLORS.reset}\n`;
  output += `${COLORS.gray}│${COLORS.reset} ${COLORS.cyan}Using tool: ${name}${COLORS.reset}\n`;
  output += `${COLORS.gray}│${COLORS.reset} ${COLORS.yellow}Parameters:${COLORS.reset}\n`;
  for (const [key, value] of Object.entries(params)) {
    output += `${COLORS.gray}│${COLORS.reset}   ${key}: ${COLORS.green}${value}${COLORS.reset}\n`;
  }
  output += `${COLORS.gray}└─────────────────────────────${COLORS.reset}\n`;
  return output;
}

export { resolvePath, getNodeAtPath };
