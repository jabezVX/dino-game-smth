import { useIDEStore } from '@/store/useIDEStore';
import type { SidebarView } from '@/types';

const VIEWS: { id: SidebarView; icon: React.ReactNode; label: string }[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'scm',
    label: 'Source Control',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M18 9a3 3 0 1 0 0-6H6" />
      </svg>
    ),
  },
  {
    id: 'debug',
    label: 'Run and Debug',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    id: 'extensions',
    label: 'Extensions',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="14" y="4" width="6" height="7" rx="1" />
        <rect x="4" y="14" width="7" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
  },
];

export default function ActivityBar() {
  const { activeView, setActiveView, sidebarVisible, toggleSidebar } = useIDEStore();

  const handleClick = (view: SidebarView) => {
    if (activeView === view && sidebarVisible) {
      toggleSidebar();
    } else {
      setActiveView(view);
      if (!sidebarVisible) toggleSidebar();
    }
  };

  return (
    <div
      style={{
        width: 48,
        height: '100%',
        background: '#181818',
        borderRight: '1px solid #2b2b2b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 4,
        flexShrink: 0,
      }}
    >
      {VIEWS.map((view) => {
        const isActive = activeView === view.id && sidebarVisible;
        return (
          <button
            key={view.id}
            title={view.label}
            onClick={() => handleClick(view.id)}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderLeft: isActive ? '2px solid #007acc' : '2px solid transparent',
              cursor: 'pointer',
              color: isActive ? '#ffffff' : '#858585',
              transition: 'color 0.1s',
              position: 'relative',
            }}
            onMouseOver={(e) => {
              if (!isActive) e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = '#ffffff1a';
            }}
            onMouseOut={(e) => {
              if (!isActive) e.currentTarget.style.color = '#858585';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {view.icon}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', marginBottom: 4 }}>
        <button
          title="Manage"
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#858585',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#ffffff1a'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#858585'; e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
