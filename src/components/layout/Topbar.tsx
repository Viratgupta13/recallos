import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, Sun, Moon, Monitor, User, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export function Topbar({ title, breadcrumb }: TopbarProps) {
  const { sidebarCollapsed, setMobileSidebarOpen } = useUIStore();
  const { theme, setTheme } = useThemeStore();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate('/login');
  };

  const themeOptions = [
    { value: 'light' as const, icon: <Sun size={14} />, label: 'Light' },
    { value: 'dark' as const, icon: <Moon size={14} />, label: 'Dark' },
    { value: 'system' as const, icon: <Monitor size={14} />, label: 'System' },
  ];

  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile menu button */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open navigation menu"
        style={{ padding: 6, display: 'none' }}
        id="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginBottom: 1 }}>
            {breadcrumb}
          </div>
        )}
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </h2>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Theme switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-alt)',
          borderRadius: 'var(--radius-md)',
          padding: 2,
          border: '1px solid var(--color-border)',
        }}>
          {themeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              aria-label={`Switch to ${opt.label} theme`}
              aria-pressed={theme === opt.value}
              title={`${opt.label} theme`}
              style={{
                padding: '5px 8px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.75rem',
                fontWeight: 500,
                background: theme === opt.value ? 'var(--color-surface)' : 'transparent',
                color: theme === opt.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: theme === opt.value ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.icon}
              <span style={{ display: 'none' }}>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* User menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-label="User menu"
            style={{
              width: 34, height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'white',
              transition: 'transform 0.15s ease',
            }}
          >
            {user ? getInitials(user.name) : <User size={14} color="white" />}
          </button>

          {userMenuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 200,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 100,
                animation: 'scaleIn 0.15s ease',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>
                  {user?.email}
                </div>
              </div>
              <div style={{ padding: '6px' }}>
                <NavLink
                  to="/profile"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                    color: 'var(--color-text-secondary)', fontSize: '0.8375rem',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={14} />
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                    color: 'var(--color-text-secondary)', fontSize: '0.8375rem',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings size={14} />
                  Settings
                </NavLink>
                <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none',
                    color: 'var(--color-danger)', fontSize: '0.8375rem', cursor: 'pointer',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
