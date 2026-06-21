import { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '@/store/useIDEStore';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'JSON', 'Markdown',
  'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'SQL', 'YAML', 'XML', 'Shell', 'Dockerfile', 'Plain Text',
];

export default function StatusBar() {
  const { panelVisible, togglePanel, activeTab, files } = useIDEStore();
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [cursorPos] = useState({ line: 1, col: 1 });
  const langRef = useRef<HTMLDivElement>(null);

  const currentLang = activeTab && files[activeTab]?.language
    ? files[activeTab].language.charAt(0).toUpperCase() + files[activeTab].language.slice(1)
    : 'Plain Text';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      style={{
        height: 22,
        background: '#007acc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        flexShrink: 0,
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <StatusItem>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>main*</span>
        </StatusItem>
        <StatusItem>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>0</span>
        </StatusItem>
        <StatusItem>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>0</span>
        </StatusItem>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <StatusItem onClick={() => {}}>
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </StatusItem>
        <StatusItem onClick={() => {}}>
          <span>Spaces: 2</span>
        </StatusItem>
        <StatusItem onClick={() => {}}>
          <span>UTF-8</span>
        </StatusItem>
        <div ref={langRef} style={{ position: 'relative' }}>
          <StatusItem onClick={() => setLangSelectorOpen(!langSelectorOpen)}>
            <span>{currentLang}</span>
          </StatusItem>
          {langSelectorOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                background: '#252526',
                border: '1px solid #454545',
                boxShadow: '0 2px 8px rgba(0,0,0,0.36)',
                zIndex: 1000,
                minWidth: 160,
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              {LANGUAGES.map(lang => (
                <div
                  key={lang}
                  onClick={() => setLangSelectorOpen(false)}
                  style={{
                    padding: '4px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: lang === currentLang ? '#ffffff' : '#cccccc',
                    background: lang === currentLang ? '#094771' : 'transparent',
                  }}
                  onMouseOver={(e) => { if (lang !== currentLang) e.currentTarget.style.background = '#094771'; }}
                  onMouseOut={(e) => { if (lang !== currentLang) e.currentTarget.style.background = 'transparent'; }}
                >
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>
        <StatusItem onClick={togglePanel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {panelVisible ? (
              <>
                <rect x="4" y="14" width="16" height="6" rx="1" />
                <rect x="4" y="4" width="16" height="8" rx="1" />
              </>
            ) : (
              <>
                <rect x="4" y="16" width="16" height="4" rx="1" />
                <rect x="4" y="4" width="16" height="10" rx="1" />
              </>
            )}
          </svg>
        </StatusItem>
        <StatusItem>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </StatusItem>
      </div>
    </div>
  );
}

function StatusItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '0 8px',
        height: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseOver={(e) => { if (onClick) e.currentTarget.style.background = '#ffffff1a'; }}
      onMouseOut={(e) => { if (onClick) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </div>
  );
}
