import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useIDEStore } from '@/store/useIDEStore';
import { getLanguageFromFileName } from '@/lib/fileSystem';
import type { editor } from 'monaco-editor';

export default function MonacoEditor() {
  const { activeTab, files, saveFileContent, markDirty } = useIDEStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const [content, setContent] = useState('');

  const fileData = activeTab ? files[activeTab] : null;
  const language = fileData?.language || (activeTab ? getLanguageFromFileName(activeTab) : 'plaintext');
  
  useEffect(() => {
    if (fileData) {
      setContent(fileData.content);
    } else if (activeTab) {
      setContent('');
    }
  }, [activeTab, fileData]);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor theme to match VS Code: dark+
    monaco.editor.defineTheme('vscode-dark-plus', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#FFFFFF0D',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#404040',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
      },
    });
    monaco.editor.setTheme('vscode-dark-plus');

    editor.focus();
  }, []);

  const handleChange = useCallback((value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    if (activeTab) {
      const currentContent = files[activeTab]?.content || '';
      markDirty(activeTab, newContent !== currentContent);
    }
  }, [activeTab, files, markDirty]);

  // Handle save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTab && editorRef.current) {
          const currentValue = editorRef.current.getValue();
          saveFileContent(activeTab, currentValue);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, saveFileContent]);

  if (!activeTab) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e1e1e',
          color: '#cccccc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#858585" strokeWidth="0.5" style={{ margin: '0 auto 20px' }}>
            <path d="M17.583.063a1.5 1.5 0 0 0-1.09.425L9.36 7.62 4.45 4.2A1.5 1.5 0 0 0 2 5.5v13a1.5 1.5 0 0 0 2.45 1.3l4.91-3.42 7.134 7.132a1.5 1.5 0 0 0 2.56-1.06V1.5a1.5 1.5 0 0 0-1.471-1.437zM17 19.793L10.436 13.23l6.564-6.563v13.126z" />
          </svg>
          <h2 style={{ fontSize: 24, fontWeight: 300, color: '#cccccc', margin: '0 0 8px 0' }}>VS Code: Web</h2>
          <p style={{ color: '#858585', fontSize: 14, margin: 0 }}>Start editing to see the power of Monaco Editor</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center', fontSize: 13 }}>
            <ShortcutHint keys={['Ctrl', 'N']} label="New File" />
            <ShortcutHint keys={['Ctrl', 'O']} label="Open File" />
            <ShortcutHint keys={['Ctrl', 'Shift', 'P']} label="Command Palette" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <Editor
        height="100%"
        language={language}
        value={content}
        theme="vscode-dark-plus"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
          minimap: { enabled: true, side: 'right' as const },
          lineNumbers: 'on' as const,
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'off' as const,
          folding: true,
          renderLineHighlight: 'all' as const,
          matchBrackets: 'always' as const,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: 'auto' as const,
            horizontal: 'auto' as const,
          },
          padding: { top: 8 },
          cursorStyle: 'line' as const,
          cursorBlinking: 'blink' as const,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on' as const,
          formatOnPaste: true,
          formatOnType: true,
        }}
        loading={
          <div style={{ width: '100%', height: '100%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#858585' }}>
            Loading editor...
          </div>
        }
      />
    </div>
  );
}

function ShortcutHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {keys.map((k, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <kbd
            style={{
              background: '#3c3c3c',
              border: '1px solid #454545',
              borderRadius: 3,
              padding: '2px 6px',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#cccccc',
            }}
          >
            {k}
          </kbd>
          {i < keys.length - 1 && <span style={{ color: '#6e6e6e' }}>+</span>}
        </span>
      ))}
      <span style={{ color: '#858585' }}>{label}</span>
    </div>
  );
}
