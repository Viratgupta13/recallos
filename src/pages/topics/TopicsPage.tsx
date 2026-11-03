import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { MemoryRing } from '@/components/ui/MemoryRing';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { topicService } from '@/services/topicService';
import { memoryService } from '@/services/memoryService';
import { forgettingService } from '@/services/forgettingService';
import type { Topic, MemoryState, RiskAssessment } from '@/types';

const CATEGORIES = ['All', 'Computer Networks', 'OOP', 'DBMS', 'Operating Systems', 'DSA', 'React'];

export default function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [memory, setMemory] = useState<MemoryState[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [t, m, r] = await Promise.all([topicService.getAll(), memoryService.getAll(), forgettingService.getRadar()]);
      setTopics(t); setMemory(m); setRisks(r);
    } catch { setError('Failed to load topics.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const getMemory = (topicId: string) => memory.find(m => m.topicId === topicId);
  const getRisk = (topicId: string) => risks.find(r => r.topicId === topicId);

  const filtered = topics.filter(t => {
    const ms = search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const mc = category === 'All' || t.category === category;
    return ms && mc;
  });

  if (error) return <AppShell title="Topics"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Topics" breadcrumb="Learn">
      <PageHeader title="Topic Library" subtitle="All topics extracted from your learning materials." />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search topics..." id="topic-search" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={c === category ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderOpen size={24} />} title="No topics found" description="Add learning materials to automatically extract topics." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(t => {
            const mem = getMemory(t.id);
            const risk = getRisk(t.id);
            return (
              <div
                key={t.id}
                className="card card-interactive animate-fade-in"
                onClick={() => navigate(`/topics/${t.id}`)}
                style={{ padding: 18, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, color: 'var(--color-text)' }}>{t.name}</h3>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)',
                      padding: '2px 7px', borderRadius: 'var(--radius-full)',
                    }}>{t.category}</span>
                  </div>
                  {mem && <MemoryRing strength={mem.memoryStrength} size={56} strokeWidth={6} />}
                </div>

                {mem && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                    <span>Recall: <strong style={{ color: 'var(--color-text)' }}>{mem.memoryStrength}%</strong></span>
                    <span>Reviews: <strong style={{ color: 'var(--color-text)' }}>{mem.reviewCount}</strong></span>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {t.keywords.slice(0, 3).map(k => (
                    <span key={k} style={{
                      fontSize: '0.675rem', background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)',
                      padding: '2px 6px', borderRadius: 6, border: '1px solid var(--color-border)',
                    }}>{k}</span>
                  ))}
                </div>

                {risk && <RiskBadge risk={risk.riskLevel} size="sm" />}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
