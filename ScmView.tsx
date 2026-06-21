import { useState } from 'react';

const CHANGES = [
  { path: 'src/App.tsx', status: 'M', label: 'Modified' },
  { path: 'src/components/Button.tsx', status: 'M', label: 'Modified' },
  { path: 'package.json', status: 'M', label: 'Modified' },
  { path: 'README.md', status: 'A', label: 'Added' },
  { path: 'tests/App.test.tsx', status: 'U', label: 'Untracked' },
];

const STATUS_COLORS: Record<string, string> = {
  M: '#e2c08d',
  A: '#89d185',
  D: '#f44336',
  U: '#858585',
};

export default function ScmView() {
  const [commitMessage, setCommitMessage] = useState('');
  const [staged, setStaged] = useState<Set<string>>(new Set());

  const toggleStage = (path: string) => {
    const newStaged = new Set(staged);
    if (newStaged.has(path)) newStaged.delete(path);
    else newStaged.add(path);
    setStaged(newStaged);
  };

  const stageAll = () => {
    if (staged.size === CHANGES.length) setStaged(new Set());
    else setStaged(new Set(CHANGES.map(c => c.path)));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#bbbbbb', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Source Control</span>
        <button
          title="Refresh"
          style={{
            width: 24,
            height: 24,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#858585',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#858585'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth="2">
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M18 9a3 3 0 1 0 0-6H6" />
        </svg>
        <span style={{ color: '#cccccc', fontSize: 13 }}>main</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 0',
            cursor: 'pointer',
          }}
          onClick={stageAll}
        >
          <span style={{ color: '#bbbbbb', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            Changes ({CHANGES.length})
          </span>
          <span style={{ color: '#007acc', fontSize: 12, cursor: 'pointer' }}>
            {staged.size === CHANGES.length ? 'Unstage All' : 'Stage All'}
          </span>
        </div>

        {CHANGES.map(change => (
          <div
            key={change.path}
            onClick={() => toggleStage(change.path)}
            style={{
              height: 22,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 4px',
              cursor: 'pointer',
              background: staged.has(change.path) ? '#264f7840' : 'transparent',
            }}
            onMouseOver={(e) => { if (!staged.has(change.path)) e.currentTarget.style.background = '#2a2d2e'; }}
            onMouseOut={(e) => { if (!staged.has(change.path)) e.currentTarget.style.background = 'transparent'; }}
          >
            <span
              style={{
                width: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: STATUS_COLORS[change.status] || '#858585',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {change.status}
            </span>
            <span style={{ color: '#cccccc', fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {change.path.split('/').pop()}
            </span>
            <span style={{ color: '#6e6e6e', fontSize: 11 }}>{change.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          style={{
            width: '100%',
            height: 60,
            background: '#3c3c3c',
            border: '1px solid #3c3c3c',
            color: '#cccccc',
            padding: '6px 8px',
            fontSize: 13,
            outline: 'none',
            resize: 'none',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.border = '1px solid #007acc'; }}
          onBlur={(e) => { e.currentTarget.style.border = '1px solid #3c3c3c'; }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => { setCommitMessage(''); }}
            style={{
              flex: 1,
              height: 28,
              background: '#0e639c',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 13,
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#1177bb'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#0e639c'; }}
          >
            Commit
          </button>
          <button
            style={{
              width: 28,
              height: 28,
              background: 'transparent',
              border: 'none',
              color: '#858585',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="More Actions"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
