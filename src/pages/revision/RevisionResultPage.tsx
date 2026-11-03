import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BarChart3, Brain, Home } from 'lucide-react';
import { useRevisionStore } from '@/stores/revisionStore';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { memoryService } from '@/services/memoryService';
import type { MemoryState } from '@/types';

export default function RevisionResultPage() {
  const navigate = useNavigate();
  const { attempts, currentSession, resetSession } = useRevisionStore();
  const [memory, setMemory] = useState<MemoryState[]>([]);

  // Memory states carry the real topic name, category and next-review date
  // (scoped to this user), so generated topics resolve to names, not raw IDs.
  useEffect(() => {
    memoryService.getAll().then(setMemory).catch(() => setMemory([]));
  }, []);

  if (!currentSession) {
    navigate('/revision');
    return null;
  }

  const averageRecall = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.recallScore, 0) / attempts.length)
    : 0;

  // Only topics the user actually answered a question for; resolve names from
  // memory states (falling back to the id until they load).
  const answeredTopicIds = [...new Set(attempts.map(a => a.topicId))];
  const topicResults = answeredTopicIds.map(tid => {
    const topicAttempts = attempts.filter(a => a.topicId === tid);
    const recall = topicAttempts.length
      ? Math.round(topicAttempts.reduce((s, a) => s + a.recallScore, 0) / topicAttempts.length)
      : 0;
    const mem = memory.find(m => m.topicId === tid);
    const risk = recall < 50 ? 'high' as const : recall < 70 ? 'medium' as const : 'low' as const;
    return { topicId: tid, topicName: mem?.topicName ?? tid, recall, risk, mem };
  });

  const strong = topicResults.filter(t => t.recall >= 70);
  const weak = topicResults.filter(t => t.recall < 70);

  const scoreColor = averageRecall >= 80 ? 'var(--color-success)' : averageRecall >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-success-soft)', color: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <CheckCircle size={32} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 6 }}>Revision Complete!</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {attempts.length} questions completed
          </p>
        </div>

        {/* Score */}
        <div className="card animate-scale-in" style={{ padding: 24, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Average Recall
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
            {averageRecall}%
          </div>
          <div style={{ marginTop: 12, maxWidth: 300, margin: '12px auto 0' }}>
            <ProgressBar value={averageRecall} animated />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{strong.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Strong Topics</div>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{weak.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Need Attention</div>
            </div>
          </div>
        </div>

        {/* Per-topic results */}
        <div className="card animate-fade-in" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.9375rem' }}>Topic Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topicResults.map(t => (
              <div key={t.topicId} style={{ padding: '12px 14px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{t.topicName}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: t.recall >= 70 ? 'var(--color-success)' : t.recall >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                      {t.recall}%
                    </span>
                    <RiskBadge risk={t.risk} size="sm" showIcon={false} />
                  </div>
                </div>
                <ProgressBar value={t.recall} height={5} />
                {t.mem && (
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Next review: {t.mem.nextReview.split('T')[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { resetSession(); navigate('/revision'); }} id="review-weak-btn">
            <Brain size={15} />
            Review Weak Topics
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/analytics')}>
            <BarChart3 size={15} />
            View Analytics
          </button>
          <button className="btn btn-ghost" onClick={() => { resetSession(); navigate('/dashboard'); }}>
            <Home size={15} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
