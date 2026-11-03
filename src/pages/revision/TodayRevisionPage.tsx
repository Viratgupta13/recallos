import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CalendarClock, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { revisionService } from '@/services/revisionService';
import { useRevisionStore } from '@/stores/revisionStore';
import type { TodayRevision } from '@/types';

export default function TodayRevisionPage() {
  const navigate = useNavigate();
  const { setSession } = useRevisionStore();
  const [today, setToday] = useState<TodayRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { setToday(await revisionService.getToday()); }
    catch { setError('Failed to load revision data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const session = await revisionService.startSession();
      setSession(session);
      navigate('/revision/session');
    } catch { setError('Failed to start revision session.'); setStarting(false); }
  };

  if (error) return <AppShell title="Today's Revision"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Today's Revision" breadcrumb="Recall">
      <PageHeader title="Today's Revision" subtitle="Your personalized revision plan for today, based on your memory state." />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : today && today.topicCount === 0 ? (
        <div className="card animate-fade-in" style={{ padding: 32, textAlign: 'center', maxWidth: 600 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>All caught up! 🎉</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
            No topics are due for revision right now. RecallOS uses spaced repetition — every
            topic you review is scheduled to come back on a future date (strong recall pushes it
            further out, weak recall brings it back sooner), so you are not meant to revise
            everything every day. Check back on your next due date, or add new material to learn.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/learning/new')}>Add More Material</button>
        </div>
      ) : today && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Topics', value: today.topicCount, icon: <CalendarClock size={18} /> },
              { label: 'Questions', value: today.questionCount, icon: <AlertTriangle size={18} /> },
              { label: 'Est. Time', value: `~${today.estimatedMinutes} min`, icon: <Clock size={18} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <div className="challenge-card animate-fade-in" style={{ marginBottom: 24, maxWidth: 600 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: 8 }}>Ready to revise?</h2>
              <p style={{ opacity: 0.85, fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
                {today.topicCount} topics · {today.questionCount} questions · ~{today.estimatedMinutes} minutes
              </p>
              <button
                className="btn btn-lg"
                onClick={handleStart}
                disabled={starting}
                id="start-revision-main-btn"
                style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700 }}
              >
                <Play size={18} fill="currentColor" />
                {starting ? 'Starting...' : 'Start Revision'}
              </button>
            </div>
          </div>

          {/* Due Topics */}
          {today.dueTopics.length > 0 && (
            <div className="card animate-fade-in" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.9375rem' }}>Due Topics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {today.dueTopics.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t.category} · {t.questionCount} questions</div>
                    </div>
                    <div style={{ width: 120 }}>
                      <ProgressBar value={t.memoryStrength} height={5} />
                      <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{t.memoryStrength}% memory</div>
                    </div>
                    <RiskBadge risk={t.riskLevel} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* At-Risk Topics */}
          {today.atRiskTopics.length > 0 && (
            <div className="card animate-fade-in" style={{ padding: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
                <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-danger)' }}>At-Risk Topics</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {today.atRiskTopics.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', background: 'var(--color-danger-soft)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t.category}</div>
                    </div>
                    <div style={{ width: 100 }}>
                      <ProgressBar value={t.memoryStrength} height={5} />
                      <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{t.memoryStrength}%</div>
                    </div>
                    <RiskBadge risk={t.riskLevel} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
