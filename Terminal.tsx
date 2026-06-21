import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useIDEStore } from '@/store/useIDEStore';
import { executeCommand, getClaudeResponse, formatToolCall } from '@/lib/commands';
import type { TerminalContext } from '@/lib/commands';

export default function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { fileSystem, files, claudeMode, setClaudeMode, addCommandHistory } = useIDEStore();
  const [cwd, setCwd] = useState('vscode-web');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const inputBufferRef = useRef('');
  const cursorPosRef = useRef(0);
  const claudeModeRef = useRef(false);
  
  // Keep refs in sync
  useEffect(() => {
    claudeModeRef.current = claudeMode;
  }, [claudeMode]);

  useEffect(() => {
    historyRef.current = useIDEStore.getState().commandHistory;
  }, []);

  const getPrompt = useCallback(() => {
    if (claudeModeRef.current) {
      return '\x1b[38;5;208mclaude>\x1b[0m ';
    }
    const displayCwd = cwd === 'vscode-web' ? '~' : `~/${cwd.replace('vscode-web/', '')}`;
    return `\x1b[32mdeveloper@vscode\x1b[0m:\x1b[34m${displayCwd}\x1b[0m$ `;
  }, [cwd]);

  const writePrompt = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.write(getPrompt());
    }
  }, [getPrompt]);

  const writeOutput = useCallback((text: string) => {
    if (!xtermRef.current) return;
    if (text === '__CLEAR__') {
      xtermRef.current.clear();
      return;
    }
    const lines = text.split('\n');
    for (const line of lines) {
      xtermRef.current.write(line + '\r\n');
    }
  }, []);

  // Stream text character by character for Claude REPL
  const streamResponse = useCallback(async (text: string) => {
    if (!xtermRef.current) return;
    // Replace ANSI codes - xterm handles them
    for (let i = 0; i < text.length; i++) {
      xtermRef.current.write(text[i]);
      if (text[i] === '\n') {
        xtermRef.current.write('\r');
      }
      // Small delay for streaming effect
      if (i % 3 === 0) {
        await new Promise(r => setTimeout(r, 5));
      }
    }
    xtermRef.current.write('\r\n');
  }, []);

  const handleCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      writePrompt();
      return;
    }

    addCommandHistory(trimmed);

    if (claudeModeRef.current) {
      if (trimmed === '/exit') {
        writeOutput('\x1b[38;5;208mExiting Claude Code REPL...\x1b[0m');
        setClaudeMode(false);
        claudeModeRef.current = false;
        writePrompt();
        return;
      }
      if (trimmed === '/clear') {
        if (xtermRef.current) xtermRef.current.clear();
        writePrompt();
        return;
      }

      const { text, toolCall } = getClaudeResponse(trimmed);

      if (text === '__CLEAR__') {
        if (xtermRef.current) xtermRef.current.clear();
        writePrompt();
        return;
      }
      if (text === '__EXIT__') {
        writeOutput('\x1b[38;5;208mExiting Claude Code REPL...\x1b[0m');
        setClaudeMode(false);
        claudeModeRef.current = false;
        writePrompt();
        return;
      }

      (async () => {
        if (xtermRef.current) {
          // Write Claude prefix
          xtermRef.current.write('\x1b[38;5;39mClaude:\x1b[0m ');
          await streamResponse(text);
          if (toolCall) {
            writeOutput(formatToolCall(toolCall.name, toolCall.params));
          }
          writePrompt();
        }
      })();
      return;
    }

    const ctx: TerminalContext = {
      cwd,
      fileSystem,
      files,
      claudeMode,
      commandHistory: historyRef.current,
    };

    const result = executeCommand(trimmed, ctx);

    if (result.claudeMode) {
      setClaudeMode(true);
      claudeModeRef.current = true;
      writeOutput(result.output);
      writePrompt();
      return;
    }

    if (result.newCwd) {
      setCwd(result.newCwd);
    }

    writeOutput(result.output);
    writePrompt();
  }, [cwd, fileSystem, files, claudeMode, setClaudeMode, addCommandHistory, writePrompt, writeOutput, streamResponse]);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#cccccc',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#f44336',
        green: '#89d185',
        yellow: '#e2c08d',
        blue: '#007acc',
        magenta: '#d18616',
        cyan: '#73c991',
        white: '#cccccc',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#89d185',
        brightYellow: '#e5e510',
        brightBlue: '#007acc',
        brightMagenta: '#d18616',
        brightCyan: '#73c991',
        brightWhite: '#ffffff',
      },
      convertEol: true,
      scrollback: 1000,
      rows: 10,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[36m╔══════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[36m║\x1b[0m  \x1b[1mWelcome to VS Code: Web Terminal\x1b[0m                \x1b[36m║\x1b[0m');
    term.writeln('\x1b[36m║\x1b[0m  Type \x1b[33mhelp\x1b[0m for commands or \x1b[33mclaude\x1b[0m for AI REPL  \x1b[36m║\x1b[0m');
    term.writeln('\x1b[36m╚══════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');

    writePrompt();

    // Handle input
    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle special keys
      if (data === '\r') { // Enter
        term.write('\r\n');
        const command = inputBufferRef.current;
        inputBufferRef.current = '';
        cursorPosRef.current = 0;
        historyIndexRef.current = -1;
        handleCommand(command);
        return;
      }

      if (data === '\x7f') { // Backspace
        if (cursorPosRef.current > 0) {
          const before = inputBufferRef.current.slice(0, cursorPosRef.current - 1);
          const after = inputBufferRef.current.slice(cursorPosRef.current);
          inputBufferRef.current = before + after;
          cursorPosRef.current--;
          term.write('\b \b');
          if (after.length > 0) {
            term.write(after + ' ');
            term.write('\x1b['.repeat(after.length + 1) + 'D');
          }
        }
        return;
      }

      if (data === '\x1b[A') { // Up arrow - history
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          const cmd = historyRef.current[historyRef.current.length - 1 - historyIndexRef.current];
          // Clear current line
          term.write('\x1b[2K\r');
          term.write(getPrompt());
          inputBufferRef.current = cmd;
          cursorPosRef.current = cmd.length;
          term.write(cmd);
        }
        return;
      }

      if (data === '\x1b[B') { // Down arrow - history
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          const cmd = historyRef.current[historyRef.current.length - 1 - historyIndexRef.current];
          term.write('\x1b[2K\r');
          term.write(getPrompt());
          inputBufferRef.current = cmd;
          cursorPosRef.current = cmd.length;
          term.write(cmd);
        } else if (historyIndexRef.current === 0) {
          historyIndexRef.current = -1;
          term.write('\x1b[2K\r');
          term.write(getPrompt());
          inputBufferRef.current = '';
          cursorPosRef.current = 0;
        }
        return;
      }

      if (data === '\x1b[C') { // Right arrow
        if (cursorPosRef.current < inputBufferRef.current.length) {
          cursorPosRef.current++;
          term.write('\x1b[C');
        }
        return;
      }

      if (data === '\x1b[D') { // Left arrow
        if (cursorPosRef.current > 0) {
          cursorPosRef.current--;
          term.write('\x1b[D');
        }
        return;
      }

      if (data === '\x03') { // Ctrl+C
        term.write('^C\r\n');
        inputBufferRef.current = '';
        cursorPosRef.current = 0;
        writePrompt();
        return;
      }

      if (data === '\x0c') { // Ctrl+L (clear)
        term.clear();
        writePrompt();
        return;
      }

      if (data === '\x04') { // Ctrl+D
        if (claudeModeRef.current) {
          handleCommand('/exit');
          return;
        }
        if (inputBufferRef.current === '') {
          term.write('exit\r\n');
          return;
        }
      }

      // Ignore control characters other than what's handled
      if (code < 32 && code !== 9) return;

      // Regular character input
      const ch = data;
      const before = inputBufferRef.current.slice(0, cursorPosRef.current);
      const after = inputBufferRef.current.slice(cursorPosRef.current);
      inputBufferRef.current = before + ch + after;
      cursorPosRef.current++;
      term.write(ch);
      if (after.length > 0) {
        term.write(after);
        term.write('\x1b['.repeat(after.length) + 'D');
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update prompt when cwd changes
  useEffect(() => {
    // Prompt is written after commands, this is just for tracking
  }, [cwd]);

  return (
    <div style={{ width: '100%', height: '100%', padding: 4, boxSizing: 'border-box' }}>
      <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
