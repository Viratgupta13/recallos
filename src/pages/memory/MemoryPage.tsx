import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MemoryRing } from '@/components/ui/MemoryRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { memoryService } from '@/services/memoryService';
import type { MemoryState } from '@/types';
import { formatRelativeDate, formatNextReview, capitalize } from '@/lib/utils';

export default function MemoryPage() {
  const [states, setStates] = useState<MemoryState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setStates(await memoryService.getAll()); }
    catch { setError('Failed to load memory data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  if (error) return <AppShell title="Memory"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Memory" breadcrumb="Recall">
      <PageHeader title="Memory" subtitle="Your estimated recall ability per topic, updated after each revision session." />

      <div className="card animate-fade-in" style={{ padding: 14, marginBottom: 20, background: 'var(--color-primary-soft)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <p style={{ fontSize: '0.8375rem', color: 'var(--color-primary)', lineHeight: 1.6 }}>
          <strong>What is Memory Strength?</strong> Memory strength represents your current estimated ability to recall this topic. It is calculated by the backend based on your recall scores, review frequency, and time since last review using spaced repetition principles.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : states.length === 0 ? (
        <EmptyState icon={<Brain size={24} />} title="No memory data yet" description="Complete revision sessions to start tracking memory strength." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {states.sort((a, b) => a.memoryStrength - b.memoryStrength).map(m => (
            <div key={m.id} className="card animate-fade-in" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{m.topicName}</h3>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)',
                    padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  }}>{m.topicCategory}</span>
                </div>
                <MemoryRing strength={m.memoryStrength} size={60} strokeWidth={7} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    <span>Confidence</span><span>{m.confidence}%</span>
                  </div>
                  <ProgressBar value={m.confidence} height={5} color="var(--color-secondary)" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{capitalize(m.difficulty)}</div>
                  <div>Difficulty</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{m.reviewCount}×</div>
                  <div>Reviews</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.725rem' }}>{formatRelativeDate(m.lastReviewed)}</div>
                  <div>Last reviewed</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.725rem' }}>{formatNextReview(m.nextReview)}</div>
                  <div>Next review</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
