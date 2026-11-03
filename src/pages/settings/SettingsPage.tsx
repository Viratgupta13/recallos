import { useState } from 'react';
import { Save, Bell, Clock, Target } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import type { UserPreferences } from '@/types';

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [prefs, setPrefs] = useState<UserPreferences>(user?.preferences ?? {
    theme: 'system', dailyRevisionTarget: 10, preferredSessionLength: 20, notificationsEnabled: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (user) {
      setAuth({ ...user, preferences: prefs }, localStorage.getItem('recall_access_token') ?? '');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <AppShell title="Settings">
      <PageHeader title="Settings" subtitle="Configure your RecallOS experience." />
      <div style={{ maxWidth: 560 }}>
        {/* Theme */}
        <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Appearance</h3>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['light', 'dark', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTheme(t); setPrefs(p => ({ ...p, theme: t })); }}
                  className={theme === t ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  style={{ flex: 1 }}
                >
                  {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '💻 System'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Revision preferences */}
        <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Revision Preferences</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="daily-target">
              <Target size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Daily Revision Target (questions)
            </label>
            <input
              id="daily-target"
              type="number"
              min={1} max={50}
              value={prefs.dailyRevisionTarget}
              onChange={e => setPrefs(p => ({ ...p, dailyRevisionTarget: parseInt(e.target.value) || 10 }))}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="session-length">
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Preferred Session Length (minutes)
            </label>
            <input
              id="session-length"
              type="number"
              min={5} max={120}
              value={prefs.preferredSessionLength}
              onChange={e => setPrefs(p => ({ ...p, preferredSessionLength: parseInt(e.target.value) || 20 }))}
              className="form-input"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Notifications</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={prefs.notificationsEnabled}
              onChange={e => setPrefs(p => ({ ...p, notificationsEnabled: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              id="notifications-toggle"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: '0.9rem' }}>
                <Bell size={14} /> Enable Notifications
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Get reminded about due revisions and at-risk topics.
              </div>
            </div>
          </label>
        </div>

        {saved && (
          <div style={{ padding: '10px 14px', background: 'var(--color-success-soft)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: 12, fontWeight: 500 }}>
            ✓ Settings saved successfully
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSave} id="save-settings-btn">
          <Save size={15} /> Save Settings
        </button>
      </div>
    </AppShell>
  );
}
