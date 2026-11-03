import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, Play, AlertTriangle, Clock, CheckCircle, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { forgettingService } from '@/services/forgettingService';
import type { RiskAssessment, RiskLevel } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

const RISK_ICONS: Record<RiskLevel, React.ReactNode> = {
  high: <AlertTriangle size={14} />,
  medium: <Clock size={14} />,
  low: <CheckCircle size={14} />,
};

export default function ForgettingRadarPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');

  const load = async () => {
    setLoading(true); setError('');
    try { setAssessments(await forgettingService.getRadar()); }
    catch { setError('Failed to load forgetting radar.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = filter === 'all' ? assessments : assessments.filter(a => a.riskLevel === filter);
  const highCount = assessments.filter(a => a.riskLevel === 'high').length;
  const medCount = assessments.filter(a => a.riskLevel === 'medium').length;
  const lowCount = assessments.filter(a => a.riskLevel === 'low').length;

  if (error) return <AppShell title="Forgetting Radar"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Forgetting Radar" breadcrumb="Analytics">
      <PageHeader
        title="Forgetting Radar"
        subtitle="Topics that need your attention before recall declines."
      />

      {/* Summary strip */}
      {!loading && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'High Risk', count: highCount, color: 'var(--color-danger)', bg: 'var(--color-danger-soft)', filter: 'high' as const },
            { label: 'Medium Risk', count: medCount, color: 'var(--color-warning)', bg: 'var(--color-warning-soft)', filter: 'medium' as const },
            { label: 'Low Risk', count: lowCount, color: 'var(--color-success)', bg: 'var(--color-success-soft)', filter: 'low' as const },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setFilter(prev => prev === s.filter ? 'all' : s.filter)}
              style={{
                padding: '10px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${filter === s.filter ? s.color : 'var(--color-border)'}`,
                background: filter === s.filter ? s.bg : 'var(--color-surface)',
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {RISK_ICONS[s.filter]}
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{s.label}</div>
              </div>
            </button>
          ))}
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="btn btn-ghost btn-sm" style={{ alignSelf: 'center' }}>
              Show All
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Radar size={24} />} title="No topics in this category" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((a, idx) => (
            <div
              key={a.topicId}
              className="card animate-fade-in"
              style={{
                padding: 20,
                borderLeft: `4px solid ${a.riskLevel === 'high' ? 'var(--color-danger)' : a.riskLevel === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'}`,
                animationDelay: `${idx * 50}ms`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{a.topicName}</h3>
                    <RiskBadge risk={a.riskLevel} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                    {a.topicCategory} · Priority #{a.priority}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Memory Strength</div>
                      <ProgressBar value={a.memoryStrength} height={6} />
                      <div style={{ fontSize: '0.725rem', fontWeight: 600, marginTop: 3 }}>{a.memoryStrength}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Last Recall Score</div>
                      <ProgressBar value={a.recallScore} height={6} />
                      <div style={{ fontSize: '0.725rem', fontWeight: 600, marginTop: 3 }}>{a.recallScore}%</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <Calendar size={12} />
                    Last reviewed: {formatRelativeDate(a.lastReviewed)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: a.riskLevel === 'high' ? 'var(--color-danger)' : a.riskLevel === 'medium' ? 'var(--color-warning)' : 'var(--color-success)',
                    background: a.riskLevel === 'high' ? 'var(--color-danger-soft)' : a.riskLevel === 'medium' ? 'var(--color-warning-soft)' : 'var(--color-success-soft)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 500,
                    maxWidth: 220,
                    textAlign: 'right',
                    lineHeight: 1.5,
                  }}>
                    {a.recommendedAction}
                  </div>
                  {a.riskLevel !== 'low' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/revision')}
                      id={`revise-${a.topicId}`}
                    >
                      <Play size={12} /> Revise Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
