import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, HelpCircle,
  CalendarClock, History, Brain, BarChart3, Radar,
  Briefcase, MessageSquare, Settings, ChevronLeft, ChevronRight,
  Zap, LogOut
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'Learning Inbox', to: '/learning', icon: <BookOpen size={17} /> },
      { label: 'Topics', to: '/topics', icon: <FolderOpen size={17} /> },
      { label: 'Question Bank', to: '/questions', icon: <HelpCircle size={17} /> },
    ],
  },
  {
    label: 'Recall',
    items: [
      { label: "Today's Revision", to: '/revision', icon: <CalendarClock size={17} /> },
      { label: 'Revision History', to: '/revision-history', icon: <History size={17} /> },
      { label: 'Memory', to: '/memory', icon: <Brain size={17} /> },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Knowledge Health', to: '/analytics', icon: <BarChart3 size={17} /> },
      { label: 'Forgetting Radar', to: '/forgetting-radar', icon: <Radar size={17} /> },
    ],
  },
  {
    label: 'Preparation',
    items: [
      { label: 'Placement', to: '/placement', icon: <Briefcase size={17} /> },
      { label: 'Interview', to: '/interview', icon: <MessageSquare size={17} /> },
    ],
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? '16px 0' : '16px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          flexShrink: 0,
          minHeight: 60,
          borderBottom: '1px solid var(--color-border)',
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30,
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #0D9488 100%)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={16} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                Recall<span style={{ color: 'var(--color-primary)' }}>OS</span>
              </span>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{
              width: 30, height: 30,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #0D9488 100%)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="white" />
            </div>
          )}
          {/* Toggle button — hidden on mobile */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ padding: 4, flexShrink: 0 }}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 8px' }}>
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {!sidebarCollapsed && (
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '10px 12px 4px',
                }}>
                  {group.label}
                </div>
              )}
              {sidebarCollapsed && <div style={{ height: 4 }} />}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setMobileSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: '8px 8px',
          flexShrink: 0,
        }}>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={sidebarCollapsed ? 'Settings' : undefined}
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <Settings size={17} />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
          <button
            className="sidebar-nav-item"
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Log Out' : undefined}
            style={{
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              width: '100%',
              background: 'none',
              border: 'none',
            }}
          >
            <LogOut size={17} />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
