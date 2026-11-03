import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Link as LinkIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MemoryRing } from '@/components/ui/MemoryRing';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { topicService } from '@/services/topicService';
import { memoryService } from '@/services/memoryService';
import { forgettingService } from '@/services/forgettingService';
import type { Topic, MemoryState, RiskAssessment } from '@/types';
import { formatDate, formatNextReview, formatRelativeDate, capitalize } from '@/lib/utils';

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [memory, setMemory] = useState<MemoryState | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [t, m, r] = await Promise.all([
          topicService.getById(id),
          memoryService.getByTopicId(id).catch(() => null),
          forgettingService.getRadar().then(rs => rs.find(r => r.topicId === id) ?? null),
        ]);
        setTopic(t); setMemory(m); setRisk(r);
      } catch { setError('Failed to load topic.'); }
      finally { setLoading(false); }
    };
    void load();
  }, [id]);

  if (error) return <AppShell title="Topic"><ErrorState message={error} onRetry={() => navigate('/topics')} /></AppShell>;
  if (loading) return <AppShell title="Topic"><div className="card" style={{ padding: 24 }}><LoadingSkeleton lines={8} /></div></AppShell>;
  if (!topic) return null;

  return (
    <AppShell title={topic.name} breadcrumb="Learn / Topics">
      <PageHeader
        title={topic.name}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/topics')}>
              <ArrowLeft size={14} /> Back
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/revision')}>
              <Play size={14} /> Practice Recall
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }} className="topic-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Memory Overview */}
          {memory && (
            <div className="card animate-fade-in" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <MemoryRing strength={memory.memoryStrength} size={100} strokeWidth={10} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 12 }}>Memory Overview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { label: 'Memory Strength', value: memory.memoryStrength, isProgress: true },
                      { label: 'Confidence', value: memory.confidence, isProgress: true },
                      { label: 'Difficulty', value: capitalize(memory.difficulty), isProgress: false },
                      { label: 'Review Count', value: memory.reviewCount, isProgress: false },
                    ].map(({ label, value, isProgress }) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{label}</div>
                        {isProgress ? (
                          <ProgressBar value={value as number} showLabel height={8} />
                        ) : (
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{value}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Last reviewed: </span>
                  <span style={{ fontWeight: 500 }}>{formatRelativeDate(memory.lastReviewed)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Next review: </span>
                  <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{formatNextReview(memory.nextReview)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Topic description */}
          <div className="card animate-fade-in" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 12 }}>About This Topic</h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{topic.description}</p>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {topic.keywords.map(k => (
                  <span key={k} style={{
                    fontSize: '0.8rem', background: 'var(--color-surface-alt)', color: 'var(--color-text)',
                    padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
                  }}>{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card animate-fade-in" style={{ padding: 18 }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Details</h4>
            {[
              { label: 'Category', value: topic.category },
              { label: 'Created', value: formatDate(topic.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            {risk && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Risk Assessment</div>
                <RiskBadge risk={risk.riskLevel} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                  {risk.recommendedAction}
                </p>
              </div>
            )}
          </div>

          {topic.relatedTopics.length > 0 && (
            <div className="card animate-fade-in" style={{ padding: 18 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 10 }}>Related Topics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topic.relatedTopics.slice(0, 3).map(rt => (
                  <button key={rt} onClick={() => navigate(`/topics/${rt}`)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                    <LinkIcon size={12} /> View topic
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={() => navigate('/revision')} style={{ width: '100%' }}>
            <Play size={15} /> Practice Recall
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .topic-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  );
}
