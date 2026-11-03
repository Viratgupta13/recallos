import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { analyticsService } from '@/services/analyticsService';
import type { AnalyticsOverview } from '@/types';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

export default function KnowledgeHealthPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await analyticsService.getOverview()); }
    catch { setError('Failed to load analytics.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  if (error) return <AppShell title="Knowledge Health"><ErrorState message={error} onRetry={load} /></AppShell>;

  const barColors = ['#7C3AED', '#0D9488', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  return (
    <AppShell title="Knowledge Health" breadcrumb="Analytics">
      <PageHeader title="Knowledge Health" subtitle="A comprehensive view of your learning performance and retention." />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Knowledge Health" value={`${data?.knowledgeHealth ?? 0}%`} subtitle="Overall score" icon={<BarChart3 size={18} />} color="var(--color-primary)" />
            <StatCard title="Total Topics" value={data?.totalTopics ?? 0} subtitle="Tracked topics" color="var(--color-secondary)" />
            <StatCard title="Average Recall" value={`${data?.averageRecall ?? 0}%`} subtitle="All sessions" color="var(--color-accent)" />
            <StatCard title="Materials" value={data?.totalMaterials ?? 0} subtitle="Learning materials" color="var(--color-info)" />
          </>
        )}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 20 }} className="analytics-chart-grid">
        {/* Recall trend */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 16 }}>Recall Trend (Last 8 Days)</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.recallTrend} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} tickFormatter={v => v.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`, 'Recall']}
                />
                <Line type="monotone" dataKey="recall" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category performance */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 16 }}>Category Performance</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.categoryPerformance} margin={{ top: 5, right: 5, bottom: 20, left: -25 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} width={100} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`, 'Avg Recall']}
                />
                <Bar dataKey="averageRecall" radius={[0, 4, 4, 0]}>
                  {data?.categoryPerformance.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category progress bars */}
      <div className="card animate-fade-in" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 16 }}>Category Memory Strength</h3>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 32 }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data?.categoryPerformance.map((c, i) => (
              <div key={c.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8375rem', fontWeight: 500 }}>{c.category}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: barColors[i % barColors.length] }}>
                    {c.averageMemoryStrength}%
                  </span>
                </div>
                <ProgressBar value={c.averageMemoryStrength} color={barColors[i % barColors.length]} height={8} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strong / Weak */}
      {!loading && data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="analytics-sw-grid">
          <div className="card animate-fade-in" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 12, color: 'var(--color-success)' }}>✓ Strong Areas</h3>
            {data.strongAreas.length ? data.strongAreas.map(a => (
              <div key={a} style={{ padding: '6px 10px', background: 'var(--color-success-soft)', borderRadius: 8, color: 'var(--color-success)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6 }}>{a}</div>
            )) : <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>No strong topics yet — keep revising to build memory strength.</p>}
          </div>
          <div className="card animate-fade-in" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 12, color: 'var(--color-warning)' }}>⚠ Needs Attention</h3>
            {data.weakAreas.length ? data.weakAreas.map(a => (
              <div key={a} style={{ padding: '6px 10px', background: 'var(--color-warning-soft)', borderRadius: 8, color: 'var(--color-warning)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6 }}>{a}</div>
            )) : <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Nothing weak right now — all tracked topics look healthy. 🎉</p>}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .analytics-chart-grid, .analytics-sw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  );
}
