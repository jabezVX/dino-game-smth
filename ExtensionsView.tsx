import { useState } from 'react';
import { useIDEStore } from '@/store/useIDEStore';
import type { Extension } from '@/types';

const STAR_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#cca700" stroke="#cca700" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function ExtensionsView() {
  const { installedExtensions, installExtension, uninstallExtension } = useIDEStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExt, setSelectedExt] = useState<Extension | null>(null);

  const filtered = searchQuery.trim()
    ? installedExtensions.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : installedExtensions;

  const installed = filtered.filter(e => e.installed);
  const available = filtered.filter(e => !e.installed);

  if (selectedExt) {
    return <ExtensionDetail ext={selectedExt} onBack={() => setSelectedExt(null)} onInstall={() => installExtension(selectedExt)} onUninstall={() => uninstallExtension(selectedExt.id)} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Extensions in Marketplace"
          style={{
            width: '100%',
            height: 28,
            background: '#3c3c3c',
            border: '1px solid #3c3c3c',
            color: '#cccccc',
            padding: '0 8px',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, sans-serif',
          }}
          onFocus={(e) => { e.currentTarget.style.border = '1px solid #007acc'; }}
          onBlur={(e) => { e.currentTarget.style.border = '1px solid #3c3c3c'; }}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {installed.length > 0 && (
          <>
            <SectionLabel label={`INSTALLED (${installed.length})`} />
            {installed.map(ext => (
              <ExtensionItem key={ext.id} ext={ext} onClick={() => setSelectedExt(ext)} onToggle={() => uninstallExtension(ext.id)} />
            ))}
          </>
        )}

        {available.length > 0 && !searchQuery && (
          <>
            <SectionLabel label="POPULAR & RECOMMENDED" />
            {available.map(ext => (
              <ExtensionItem key={ext.id} ext={ext} onClick={() => setSelectedExt(ext)} onToggle={() => installExtension(ext)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ExtensionItem({ ext, onClick, onToggle }: { ext: Extension; onClick: () => void; onToggle: () => void }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        display: 'flex',
        gap: 8,
        cursor: 'pointer',
        alignItems: 'flex-start',
      }}
      onClick={onClick}
      onMouseOver={(e) => { e.currentTarget.style.background = '#2a2d2e'; }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: '#3c3c3c',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {ext.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#cccccc', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ext.name}</span>
          {ext.installed && (
            <span style={{ color: '#89d185', fontSize: 10, flexShrink: 0 }}>✓</span>
          )}
        </div>
        <div style={{ color: '#858585', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ext.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ color: '#6e6e6e', fontSize: 11 }}>{ext.author}</span>
          <span style={{ color: '#6e6e6e', fontSize: 11 }}>{ext.installs}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {STAR_ICON}
            <span style={{ color: '#cccccc', fontSize: 11 }}>{ext.rating}</span>
          </span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          height: 24,
          padding: '0 8px',
          background: ext.installed ? 'transparent' : '#0e639c',
          border: ext.installed ? '1px solid #6e6e6e' : 'none',
          color: ext.installed ? '#cccccc' : '#ffffff',
          cursor: 'pointer',
          fontSize: 12,
          flexShrink: 0,
        }}
        onMouseOver={(e) => {
          if (ext.installed) { e.currentTarget.style.borderColor = '#f44336'; e.currentTarget.style.color = '#f44336'; }
          else { e.currentTarget.style.background = '#1177bb'; }
        }}
        onMouseOut={(e) => {
          if (ext.installed) { e.currentTarget.style.borderColor = '#6e6e6e'; e.currentTarget.style.color = '#cccccc'; }
          else { e.currentTarget.style.background = '#0e639c'; }
        }}
      >
        {ext.installed ? 'Uninstall' : 'Install'}
      </button>
    </div>
  );
}

function ExtensionDetail({ ext, onBack, onInstall, onUninstall }: { ext: Extension; onBack: () => void; onInstall: () => void; onUninstall: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2b2b2b' }}>
        <button
          onClick={onBack}
          style={{
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#cccccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#2a2d2e'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span style={{ color: '#cccccc', fontSize: 13 }}>Extension Details</span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: '#3c3c3c',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              flexShrink: 0,
            }}
          >
            {ext.icon}
          </div>
          <div>
            <h2 style={{ color: '#ffffff', fontSize: 20, fontWeight: 600, margin: '0 0 4px 0' }}>{ext.name}</h2>
            <p style={{ color: '#858585', fontSize: 13, margin: '0 0 8px 0' }}>{ext.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#6e6e6e', fontSize: 12 }}>v{ext.version}</span>
              <span style={{ color: '#6e6e6e', fontSize: 12 }}>by {ext.author}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {STAR_ICON}
                <span style={{ color: '#cccccc', fontSize: 12 }}>{ext.rating}</span>
              </span>
              <span style={{ color: '#6e6e6e', fontSize: 12 }}>{ext.installs} installs</span>
            </div>
          </div>
        </div>

        <button
          onClick={ext.installed ? onUninstall : onInstall}
          style={{
            height: 32,
            padding: '0 16px',
            background: ext.installed ? 'transparent' : '#0e639c',
            border: ext.installed ? '1px solid #f44336' : 'none',
            color: ext.installed ? '#f44336' : '#ffffff',
            cursor: 'pointer',
            fontSize: 14,
            marginBottom: 16,
          }}
          onMouseOver={(e) => {
            if (!ext.installed) e.currentTarget.style.background = '#1177bb';
          }}
          onMouseOut={(e) => {
            if (!ext.installed) e.currentTarget.style.background = '#0e639c';
          }}
        >
          {ext.installed ? 'Uninstall' : 'Install'}
        </button>

        <div style={{ borderTop: '1px solid #2b2b2b', paddingTop: 16 }}>
          <h3 style={{ color: '#cccccc', fontSize: 14, fontWeight: 600, margin: '0 0 8px 0' }}>README</h3>
          <div style={{ color: '#cccccc', fontSize: 13, lineHeight: 1.6 }}>
            <h4 style={{ color: '#ffffff', margin: '12px 0 4px 0' }}>{ext.name}</h4>
            <p>{ext.description}</p>
            <h4 style={{ color: '#ffffff', margin: '12px 0 4px 0' }}>Features</h4>
            <ul style={{ paddingLeft: 20 }}>
              <li>Syntax highlighting and IntelliSense</li>
              <li>Code: formatting and linting</li>
              <li>Debugging support</li>
              <li>Snippets and code completion</li>
            </ul>
            <h4 style={{ color: '#ffffff', margin: '12px 0 4px 0' }}>Requirements</h4>
            <p>VS Code: 1.70.0 or higher</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      padding: '4px 12px',
      color: '#bbbbbb',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {label}
    </div>
  );
}
