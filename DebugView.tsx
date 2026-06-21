import { useState } from 'react';

const CONFIGS = [
  { label: 'Launch Chrome', type: 'chrome' },
  { label: 'Node.js: Server', type: 'node' },
  { label: 'Python: Current File', type: 'python' },
];

const VARIABLES = [
  { name: 'count', value: '0', type: 'number' },
  { name: 'isModalOpen', value: 'false', type: 'boolean' },
  { name: 'title', value: '"My Awesome App"', type: 'string' },
  { name: 'user', value: '{ id: 1, name: "John" }', type: 'object' },
];

const WATCH = [
  { expr: 'count * 2', value: '0' },
  { expr: 'title.length', value: '14' },
];

const CALL_STACK = [
  { fn: 'App', file: 'App.tsx', line: 12 },
  { fn: 'renderWithHooks', file: 'react-dom.development.js', line: 16305 },
  { fn: 'mountIndeterminateComponent', file: 'react-dom.development.js', line: 20074 },
];

const BREAKPOINTS = [
  { file: 'src/App.tsx', line: 15, enabled: true },
  { file: 'src/components/Button.tsx', line: 8, enabled: true },
  { file: 'src/utils/helpers.ts', line: 3, enabled: false },
];

export default function DebugView() {
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [sections, setSections] = useState<Record<string, boolean>>({
    variables: true,
    watch: true,
    callstack: true,
    breakpoints: true,
  });
  const [isRunning, setIsRunning] = useState(false);

  const toggleSection = (key: string) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px', overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            height: 28,
            padding: '0 12px',
            background: '#0e639c',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#1177bb'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#0e639c'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {isRunning ? 'Stop' : 'Run'}
        </button>
        <select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(Number(e.target.value))}
          style={{
            flex: 1,
            height: 28,
            background: '#3c3c3c',
            border: '1px solid #3c3c3c',
            color: '#cccccc',
            fontSize: 13,
            outline: 'none',
            padding: '0 4px',
          }}
        >
          {CONFIGS.map((c, i) => (
            <option key={i} value={i}>{c.label}</option>
          ))}
        </select>
      </div>

      <CollapsibleSection title="Variables" open={sections.variables} onToggle={() => toggleSection('variables')}>
        <div style={{ paddingLeft: 8 }}>
          {VARIABLES.map((v, i) => (
            <div key={i} style={{ height: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'monospace' }}>
              <span style={{ color: '#9cdcfe' }}>{v.name}</span>
              <span style={{ color: '#6e6e6e' }}>:</span>
              <span style={{ color: v.type === 'string' ? '#ce9178' : v.type === 'boolean' ? '#569cd6' : '#b5cea8' }}>{v.value}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Watch" open={sections.watch} onToggle={() => toggleSection('watch')}>
        <div style={{ paddingLeft: 8 }}>
          {WATCH.map((w, i) => (
            <div key={i} style={{ height: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'monospace' }}>
              <span style={{ color: '#9cdcfe' }}>{w.expr}</span>
              <span style={{ color: '#6e6e6e' }}>=</span>
              <span style={{ color: '#b5cea8' }}>{w.value}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Call Stack" open={sections.callstack} onToggle={() => toggleSection('callstack')}>
        <div style={{ paddingLeft: 8 }}>
          {CALL_STACK.map((c, i) => (
            <div key={i} style={{ height: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ color: '#cccccc', fontFamily: 'monospace' }}>{c.fn}</span>
              <span style={{ color: '#6e6e6e' }}>at</span>
              <span style={{ color: '#858585' }}>{c.file}:{c.line}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Breakpoints" open={sections.breakpoints} onToggle={() => toggleSection('breakpoints')}>
        <div style={{ paddingLeft: 8 }}>
          {BREAKPOINTS.map((bp, i) => (
            <div key={i} style={{ height: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={bp.enabled ? '#e51400' : 'none'} stroke="#e51400" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
              </svg>
              <span style={{ color: bp.enabled ? '#cccccc' : '#6e6e6e', fontFamily: 'monospace' }}>
                {bp.file}:{bp.line}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        onClick={onToggle}
        style={{
          height: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          color: '#bbbbbb',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.1s' }}>
          <path d="M3 2L7 5L3 8" stroke="#858585" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </div>
      {open && children}
    </div>
  );
}
