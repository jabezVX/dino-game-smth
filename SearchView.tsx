import { useState, useCallback, useRef, useEffect } from 'react';
import { useIDEStore } from '@/store/useIDEStore';
import { flattenTree } from '@/lib/fileSystem';
import type { SearchResult } from '@/types';

export default function SearchView() {
  const { fileSystem, files, openFile } = useIDEStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showReplace, setShowReplace] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    const flat = flattenTree(fileSystem);
    const newResults: SearchResult[] = [];

    for (const { path, node } of flat) {
      if (node.type !== 'file') continue;
      const content = files[path]?.content || '';
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let searchRegex: RegExp;
        try {
          const flags = matchCase ? 'g' : 'gi';
          if (useRegex) {
            searchRegex = new RegExp(searchQuery, flags);
          } else {
            const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            searchRegex = new RegExp(escaped, flags);
          }
        } catch {
          continue;
        }

        const matches: { start: number; end: number }[] = [];
        let match;
        while ((match = searchRegex.exec(line)) !== null) {
          matches.push({ start: match.index, end: match.index + match[0].length });
          if (match.index === searchRegex.lastIndex) searchRegex.lastIndex++;
        }

        if (matches.length > 0) {
          newResults.push({
            file: path,
            line: i + 1,
            preview: line.trim().substring(0, 100),
            matches,
          });
        }
      }
    }
    setResults(newResults);
  }, [searchQuery, matchCase, matchWholeWord, useRegex, fileSystem, files]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(performSearch, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = null; };
  }, [searchQuery, matchCase, useRegex, performSearch]);

  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.file]) acc[r.file] = [];
    acc[r.file].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          style={{
            flex: 1,
            height: 28,
            background: '#3c3c3c',
            border: '1px solid #3c3c3c',
            color: '#cccccc',
            padding: '0 8px',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
          onFocus={(e) => { e.currentTarget.style.border = '1px solid #007acc'; }}
          onBlur={(e) => { e.currentTarget.style.border = '1px solid #3c3c3c'; }}
        />
        <button
          onClick={() => setShowReplace(!showReplace)}
          title="Toggle Replace"
          style={{
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#858585',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 3 18 9" />
            <polyline points="6 15 12 21 18 15" />
          </svg>
        </button>
      </div>

      {showReplace && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <input
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace"
            style={{
              flex: 1,
              height: 28,
              background: '#3c3c3c',
              border: '1px solid #3c3c3c',
              color: '#cccccc',
              padding: '0 8px',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'system-ui, sans-serif',
            }}
            onFocus={(e) => { e.currentTarget.style.border = '1px solid #007acc'; }}
            onBlur={(e) => { e.currentTarget.style.border = '1px solid #3c3c3c'; }}
          />
          <button
            onClick={() => {}}
            style={{
              height: 28,
              padding: '0 12px',
              background: '#0e639c',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Replace All
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
        <ToggleButton active={matchCase} onClick={() => setMatchCase(!matchCase)} title="Match Case">
          <span style={{ fontSize: 12, fontWeight: 700 }}>Aa</span>
        </ToggleButton>
        <ToggleButton active={matchWholeWord} onClick={() => setMatchWholeWord(!matchWholeWord)} title="Match Whole Word">
          <span style={{ fontSize: 12 }}>ab|</span>
        </ToggleButton>
        <ToggleButton active={useRegex} onClick={() => setUseRegex(!useRegex)} title="Use Regular Expression">
          <span style={{ fontSize: 12 }}>.*</span>
        </ToggleButton>
      </div>

      <div style={{ color: '#6e6e6e', fontSize: 12, marginBottom: 4 }}>
        {results.length > 0 ? `${results.length} results in ${Object.keys(groupedResults).length} files` : searchQuery ? 'No results' : ''}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(groupedResults).map(([file, fileResults]) => (
          <div key={file}>
            <div
              style={{
                padding: '4px 8px',
                color: '#cccccc',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              {file.split('/').pop()} ({fileResults.length})
            </div>
            {fileResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => openFile(file)}
                style={{
                  padding: '2px 8px 2px 24px',
                  cursor: 'pointer',
                  color: '#cccccc',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#2a2d2e'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: '#6e6e6e', marginRight: 8 }}>{result.line}</span>
                {highlightMatches(result.preview, result.matches)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleButton({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        background: active ? '#37373d' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? '#ffffff' : '#858585',
      }}
      onMouseOver={(e) => { if (!active) e.currentTarget.style.background = '#2a2d2e'; }}
      onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

function highlightMatches(preview: string, matches: { start: number; end: number }[]): React.ReactNode {
  if (!matches.length) return preview;
  const elements: React.ReactNode[] = [];
  let lastEnd = 0;
  matches.forEach((m, i) => {
    if (m.start > lastEnd) {
      elements.push(<span key={`t${i}`}>{preview.substring(lastEnd, m.start)}</span>);
    }
    elements.push(
      <span key={`h${i}`} style={{ background: '#f5e9a280', color: '#1e1e1e' }}>
        {preview.substring(m.start, m.end)}
      </span>
    );
    lastEnd = m.end;
  });
  if (lastEnd < preview.length) {
    elements.push(<span key="tail">{preview.substring(lastEnd)}</span>);
  }
  return elements;
}
