import { useIDEStore } from '@/store/useIDEStore';
import TerminalPanel from './Terminal';

const PANEL_TABS = [
  { id: 'terminal' as const, label: 'Terminal' },
  { id: 'output' as const, label: 'Output' },
  { id: 'problems' as const, label: 'Problems' },
  { id: 'debug-console' as const, label: 'Debug Console' },
];

const SAMPLE_OUTPUT = [
  '[info] Starting development server...',
  '[info] Server running at http://localhost:3000',
  '[info] HMR enabled',
  '[warn] "any" type detected in src/types.ts:12',
  '[info] Build completed in 342ms',
];

const SAMPLE_PROBLEMS = [
  { severity: 'error' as const, message: "Cannot find module '@/components/Button'", file: 'src/App.tsx', line: 1, col: 23 },
  { severity: 'warning' as const, message: "'any' type is not recommended", file: 'src/types.ts', line: 12, col: 8 },
  { severity: 'info' as const, message: "File should end with a newline", file: 'README.md', line: 20, col: 1 },
];

const SEVERITY_ICONS = {
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cca700" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#75beff" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export default function Panel() {
  const { panelActiveTab, setPanelActiveTab, panelVisible, togglePanel } = useIDEStore();

  if (!panelVisible) return null;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#1e1e1e',
        borderTop: '1px solid #2b2b2b',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          height: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          borderBottom: '1px solid #2b2b2b',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', height: '100%' }}>
          {PANEL_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPanelActiveTab(tab.id)}
              style={{
                height: 35,
                padding: '0 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: panelActiveTab === tab.id ? '1px solid #007acc' : '1px solid transparent',
                color: panelActiveTab === tab.id ? '#ffffff' : '#858585',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'system-ui, sans-serif',
              }}
              onMouseOver={(e) => { if (panelActiveTab !== tab.id) e.currentTarget.style.color = '#cccccc'; }}
              onMouseOut={(e) => { if (panelActiveTab !== tab.id) e.currentTarget.style.color = '#858585'; }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <PanelButton title="Maximize Panel" onClick={() => {}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </PanelButton>
          <PanelButton title="Close Panel" onClick={togglePanel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </PanelButton>
        </div>
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {panelActiveTab === 'terminal' && <TerminalPanel />}
        {panelActiveTab === 'output' && <OutputPanel />}
        {panelActiveTab === 'problems' && <ProblemsPanel />}
        {panelActiveTab === 'debug-console' && <DebugConsolePanel />}
      </div>
    </div>
  );
}

function PanelButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#858585',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#ffffff1a'; }}
      onMouseOut={(e) => { e.currentTarget.style.color = '#858585'; e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

function OutputPanel() {
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 8, fontFamily: 'monospace', fontSize: 12, color: '#cccccc' }}>
      {SAMPLE_OUTPUT.map((line, i) => (
        <div key={i} style={{ padding: '2px 0' }}>{line}</div>
      ))}
    </div>
  );
}

function ProblemsPanel() {
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2b2b2b', color: '#858585' }}>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 400, width: 30 }}></th>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 400 }}>Message</th>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 400 }}>File</th>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 400, width: 60 }}>Line</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLE_PROBLEMS.map((p, i) => (
            <tr
              key={i}
              style={{ borderBottom: '1px solid #1e1e1e', cursor: 'pointer' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#2a2d2e'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <td style={{ padding: '4px 8px' }}>{SEVERITY_ICONS[p.severity]}</td>
              <td style={{ padding: '4px 8px', color: '#cccccc' }}>{p.message}</td>
              <td style={{ padding: '4px 8px', color: '#858585', fontFamily: 'monospace' }}>{p.file}</td>
              <td style={{ padding: '4px 8px', color: '#858585' }}>{p.line}:{p.col}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DebugConsolePanel() {
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 8, fontFamily: 'monospace', fontSize: 12 }}>
      <div style={{ color: '#6e6e6e' }}>Debug console ready. Start debugging to see output.</div>
    </div>
  );
}
