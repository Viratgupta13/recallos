import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    setAuth({ ...user, name }, localStorage.getItem('recall_access_token') ?? '');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell title="Profile">
      <PageHeader title="Profile" subtitle="Manage your personal information and preferences." />

      <div style={{ maxWidth: 600 }}>
        {/* Avatar */}
        <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'white',
              }}>
                {getInitials(user.name)}
              </div>
              <button
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-primary)', border: '2px solid var(--color-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}
                aria-label="Change avatar"
                title="Avatar upload will be available when backend is connected"
              >
                <Camera size={13} />
              </button>
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{user.name}</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{user.email}</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="form-input"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          {saved && (
            <div style={{ padding: '10px 14px', background: 'var(--color-success-soft)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: 12, fontWeight: 500 }}>
              ✓ Profile updated successfully
            </div>
          )}

          <button className="btn btn-primary" onClick={handleSave} id="save-profile-btn">
            <Save size={15} /> Save Changes
          </button>
        </div>

        {/* Theme */}
        <div className="card animate-fade-in" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Theme Preference</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${theme === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: theme === t ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: theme === t ? 'var(--color-primary)' : 'var(--color-text)',
                  transition: 'all 0.15s ease',
                }}
              >
                {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '💻 System'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
