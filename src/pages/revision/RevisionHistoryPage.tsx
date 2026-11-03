import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { revisionService } from '@/services/revisionService';
import { topicService } from '@/services/topicService';
import type { RevisionSession, Topic } from '@/types';
import { formatDate } from '@/lib/utils';

export default function RevisionHistoryPage() {
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [s, t] = await Promise.all([revisionService.getHistory(), topicService.getAll()]);
      setSessions(s); setTopics(t);
    } catch { setError('Failed to load revision history.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const getTopicNames = (ids: string[]) => ids.map(id => topics.find(t => t.id === id)?.name ?? '').filter(Boolean).join(', ');

  const recallColor = (v: number) => v >= 80 ? 'var(--color-success)' : v >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

  if (error) return <AppShell title="Revision History"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Revision History" breadcrumb="Recall">
      <PageHeader title="Revision History" subtitle="Your previous revision sessions and performance." />
      <div className="card animate-fade-in" style={{ overflow: 'hidden' }}>
        {loading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)' }}>
                {['Date', 'Topics', 'Questions', 'Avg. Recall', 'Duration'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</tbody>
          </table>
        ) : sessions.length === 0 ? (
          <EmptyState icon={<History size={24} />} title="No revision sessions yet" description="Complete your first revision session to see history here." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)' }}>
                {['Date', 'Topics', 'Questions', 'Avg. Recall', 'Duration'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-alt)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatDate(s.startedAt)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: 200 }}>
                    {getTopicNames(s.topicIds) || `${s.topicIds.length} topics`}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{s.questionsCompleted}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 700, color: recallColor(s.averageRecall) }}>{s.averageRecall}%</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    {s.durationMinutes ? `${s.durationMinutes} min` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
