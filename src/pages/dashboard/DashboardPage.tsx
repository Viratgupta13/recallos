import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Brain, CalendarClock, Flame, BookOpen, Radar,
  ArrowRight, Play, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { StatCardSkeleton, CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { analyticsService } from '@/services/analyticsService';
import { forgettingService } from '@/services/forgettingService';
import { materialService } from '@/services/materialService';
import { revisionService } from '@/services/revisionService';
import type { AnalyticsOverview, RiskAssessment, LearningMaterial, TodayRevision } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { getGreeting, formatRelativeDate } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [today, setToday] = useState<TodayRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, r, m, t] = await Promise.all([
        analyticsService.getOverview(),
        forgettingService.getRadar(),
        materialService.getAll(),
        revisionService.getToday(),
      ]);
      setAnalytics(a);
      setRisks(r.slice(0, 5));
      setMaterials(m.slice(0, 4));
      setToday(t);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (error) return (
    <AppShell title="Dashboard">
      <ErrorState message={error} onRetry={load} />
    </AppShell>
  );

  return (
    <AppShell title="Dashboard">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
          {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Let's strengthen what you already know.
        </p>
      </div>

      {/* KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Knowledge Health"
              value={`${analytics?.knowledgeHealth ?? 0}%`}
              subtitle="Overall retention score"
              icon={<Activity size={18} />}
              color="var(--color-primary)"
            />
            <StatCard
              title="Due Today"
              value={analytics?.dueToday ?? 0}
              subtitle="Topics needing review"
              icon={<CalendarClock size={18} />}
              color="var(--color-secondary)"
            />
            <StatCard
              title="Average Recall"
              value={`${analytics?.averageRecall ?? 0}%`}
              subtitle="Last 7 sessions"
              icon={<Brain size={18} />}
              color="var(--color-accent)"
            />
            <StatCard
              title="Current Streak"
              value={`${analytics?.currentStreak ?? 0} days`}
              subtitle="Keep it going!"
              icon={<Flame size={18} />}
              color="var(--color-success)"
            />
          </>
        )}
      </div>

      {/* Main grid: Challenge + Radar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 24,
      }}
        className="dashboard-main-grid"
      >
        {/* Today's Challenge */}
        <div className="challenge-card animate-fade-in">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CalendarClock size={16} style={{ opacity: 0.8 }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Today's Challenge
              </span>
            </div>

            {loading || !today ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
                <div className="skeleton" style={{ height: 24, width: '70%', borderRadius: 8, opacity: 0.4 }} />
                <div className="skeleton" style={{ height: 48, width: '90%', borderRadius: 8, opacity: 0.4 }} />
              </div>
            ) : today.topicCount === 0 ? (
              (analytics?.totalTopics ?? 0) > 0 ? (
                <>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10 }}>
                    All caught up! 🎉
                  </h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: 20, lineHeight: 1.5 }}>
                    Nothing is due for revision right now. Spaced repetition brings each
                    topic back on its scheduled date — strong answers return later, weak
                    ones sooner — so you don't revise everything every day.
                  </p>
                  <button
                    className="btn"
                    onClick={() => navigate('/learning/new')}
                    style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700, padding: '10px 20px' }}
                  >
                    <BookOpen size={15} />
                    Add More Material
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10 }}>
                    Nothing to revise yet
                  </h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: 20, lineHeight: 1.5 }}>
                    Add your first learning material to generate topics and questions.
                    Your daily revision shows up here once you have something to recall.
                  </p>
                  <button
                    className="btn"
                    onClick={() => navigate('/learning/new')}
                    style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700, padding: '10px 20px' }}
                  >
                    <BookOpen size={15} />
                    Add Learning Material
                  </button>
                </>
              )
            ) : (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16 }}>
                  {today.topicCount} Topics • {today.questionCount} Questions
                </h2>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  {[
                    { label: 'Topics', value: today.topicCount },
                    { label: 'Questions', value: today.questionCount },
                    { label: 'Est. Time', value: `~${today.estimatedMinutes} min` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{value}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {today.dueTopics.slice(0, 2).map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                    fontSize: '0.8125rem', opacity: 0.9,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: t.riskLevel === 'high' ? '#FCA5A5' : t.riskLevel === 'medium' ? '#FCD34D' : '#6EE7B7',
                    }} />
                    {t.name}
                  </div>
                ))}

                <button
                  className="btn"
                  onClick={() => navigate('/revision')}
                  id="start-revision-btn"
                  style={{
                    marginTop: 18,
                    background: 'white',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    padding: '10px 20px',
                  }}
                >
                  <Play size={15} fill="currentColor" />
                  Start Revision
                </button>
              </>
            )}
          </div>
        </div>

        {/* Forgetting Radar Preview */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radar size={16} style={{ color: 'var(--color-danger)' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Forgetting Radar</h3>
            </div>
            <button
              onClick={() => navigate('/forgetting-radar')}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {risks.slice(0, 4).map(r => (
                <div key={r.topicId} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-alt)',
                  gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.8375rem', color: 'var(--color-text)' }}>
                      {r.topicName}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                      {r.topicCategory}
                    </div>
                  </div>
                  <RiskBadge risk={r.riskLevel} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recall Trend Chart */}
      <div className="card animate-fade-in" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Recall Trend (Last 8 Days)</h3>
          </div>
          <button onClick={() => navigate('/analytics')} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
            Full Analytics <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={analytics?.recallTrend ?? []} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickFormatter={v => v.slice(5)}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v: any) => [`${v}%`, 'Recall']}
                labelFormatter={l => `Date: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="recall"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom grid: Recent Materials + Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}
        className="dashboard-bottom-grid">

        {/* Recently Learned */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} style={{ color: 'var(--color-secondary)' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Recently Learned</h3>
            </div>
            <button onClick={() => navigate('/learning')} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <CardSkeleton />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {materials.map(m => (
                <div
                  key={m.id}
                  className="card-interactive"
                  onClick={() => navigate(`/learning/${m.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-alt)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--color-primary-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--color-primary)',
                  }}>
                    <BookOpen size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.8375rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                      {m.category} · {formatRelativeDate(m.updatedAt)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600,
                    color: 'var(--color-secondary)',
                    background: 'var(--color-secondary-soft)',
                    padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  }}>
                    {m.topicCount} topics
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strong / Weak Areas */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 14 }}>Performance Areas</h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 28 }} />)}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <CheckCircle size={13} style={{ color: 'var(--color-success)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>Strong Areas</span>
                </div>
                {analytics?.strongAreas.slice(0, 3).map(a => (
                  <div key={a} style={{
                    fontSize: '0.8125rem', padding: '5px 10px', borderRadius: 8,
                    background: 'var(--color-success-soft)', color: 'var(--color-success)',
                    marginBottom: 4, fontWeight: 500,
                  }}>{a}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={13} style={{ color: 'var(--color-warning)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-warning)' }}>Needs Attention</span>
                </div>
                {analytics?.weakAreas.slice(0, 3).map(a => (
                  <div key={a} style={{
                    fontSize: '0.8125rem', padding: '5px 10px', borderRadius: 8,
                    background: 'var(--color-warning-soft)', color: 'var(--color-warning)',
                    marginBottom: 4, fontWeight: 500,
                  }}>{a}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-main-grid { grid-template-columns: 1fr !important; }
          .dashboard-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </AppShell>
  );
}
