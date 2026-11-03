import { useEffect, useState } from 'react';
import { Briefcase, Play, Trophy, Target } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { placementService } from '@/services/placementService';
import type { PlacementTest, PlacementCategory } from '@/types';
import { capitalize } from '@/lib/utils';

const CATEGORY_CONFIG: Record<PlacementCategory, { label: string; color: string; bg: string }> = {
  aptitude: { label: 'Aptitude', color: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
  technical: { label: 'Technical', color: 'var(--color-secondary)', bg: 'var(--color-secondary-soft)' },
  coding: { label: 'Coding', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)' },
};

const STATUS_STYLE = {
  'not-started': { color: 'var(--color-text-muted)', label: 'Not Started' },
  'in-progress': { color: 'var(--color-warning)', label: 'In Progress' },
  'completed': { color: 'var(--color-success)', label: 'Completed' },
};

export default function PlacementPage() {
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<PlacementCategory | 'all'>('all');

  const load = async () => {
    setLoading(true); setError('');
    try { setTests(await placementService.getTests()); }
    catch { setError('Failed to load placement tests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const categories: PlacementCategory[] = ['aptitude', 'technical', 'coding'];
  const filtered = activeCategory === 'all' ? tests : tests.filter(t => t.category === activeCategory);
  const completed = tests.filter(t => t.status === 'completed').length;
  const avgScore = tests.filter(t => t.bestScore !== undefined).reduce((s, t) => s + (t.bestScore ?? 0), 0) / Math.max(1, tests.filter(t => t.bestScore !== undefined).length);

  if (error) return <AppShell title="Placement"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Placement Preparation" breadcrumb="Preparation">
      <PageHeader title="Placement Preparation" subtitle="Prepare for campus placements with aptitude, technical, and coding practice." />

      {/* Stats */}
      {!loading && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Tests Completed', value: completed, icon: <Trophy size={18} />, color: 'var(--color-success)' },
            { label: 'Average Score', value: `${Math.round(avgScore)}%`, icon: <Target size={18} />, color: 'var(--color-primary)' },
            { label: 'Total Tests', value: tests.length, icon: <Briefcase size={18} />, color: 'var(--color-secondary)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1, minWidth: 140 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} className={activeCategory === c ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
            {CATEGORY_CONFIG[c].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Briefcase size={24} />} title="No tests in this category" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(t => {
            const catConfig = CATEGORY_CONFIG[t.category];
            const statusStyle = STATUS_STYLE[t.status];
            return (
              <div key={t.id} className="card animate-fade-in" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, background: catConfig.bg, color: catConfig.color, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {catConfig.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: statusStyle.color }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{t.title}</h3>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: '0.775rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  <span>📝 {t.questionCount} questions</span>
                  <span>⏱ {t.duration} min</span>
                  <span style={{ color: t.difficulty === 'hard' ? 'var(--color-danger)' : t.difficulty === 'medium' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {capitalize(t.difficulty)}
                  </span>
                </div>

                {t.bestScore !== undefined && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Best Score</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{t.bestScore}%</span>
                    </div>
                    <div className="progress-bar-track" style={{ height: 5 }}>
                      <div className="progress-bar-fill" style={{ width: `${t.bestScore}%`, background: 'var(--color-success)' }} />
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  id={`start-test-${t.id}`}
                  onClick={() => alert('Test functionality will be connected to the backend.')}
                >
                  <Play size={13} />
                  {t.status === 'completed' ? 'Retake Test' : t.status === 'in-progress' ? 'Continue' : 'Start Test'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
