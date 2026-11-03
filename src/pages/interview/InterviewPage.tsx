import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { interviewService } from '@/services/placementService';
import type { InterviewQuestion, InterviewStage } from '@/types';
import { getDifficultyColor, capitalize } from '@/lib/utils';

const STAGES: { value: InterviewStage; label: string; desc: string }[] = [
  { value: 'remember', label: 'Remember', desc: 'Basic recall and definition' },
  { value: 'explain', label: 'Explain', desc: 'Explain concepts in own words' },
  { value: 'debug', label: 'Debug', desc: 'Find and fix issues' },
  { value: 'implement', label: 'Implement', desc: 'Write code from scratch' },
  { value: 'interview', label: 'Interview', desc: 'Real interview-style questions' },
];

const CATEGORIES = ['All', 'DSA', 'OOP', 'DBMS', 'OS', 'CN', 'Programming', 'System Design'];

export default function InterviewPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<InterviewStage | 'all'>('all');
  const [category, setCategory] = useState('All');

  const load = async () => {
    setLoading(true); setError('');
    try { setQuestions(await interviewService.getQuestions()); }
    catch { setError('Failed to load interview questions.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = questions.filter(q => {
    const ms = stage === 'all' || q.stage === stage;
    const mc = category === 'All' || q.category === category;
    return ms && mc;
  });

  if (error) return <AppShell title="Interview Prep"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Interview Preparation" breadcrumb="Preparation">
      <PageHeader title="Interview Preparation" subtitle="Practice progressively — from recall to full interview simulations." />

      {/* Stage progression */}
      <div style={{ marginBottom: 20, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, background: 'var(--color-surface-alt)', padding: 4, borderRadius: 'var(--radius-lg)', width: 'fit-content', border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setStage('all')}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
              background: stage === 'all' ? 'var(--color-surface)' : 'transparent',
              color: stage === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: stage === 'all' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap',
            }}
          >
            All Stages
          </button>
          {STAGES.map((s, i) => (
            <React.Fragment key={s.value}>
              {i > 0 && <div style={{ width: 1, background: 'var(--color-border)', margin: '4px 0' }} />}
              <button
                onClick={() => setStage(s.value)}
                title={s.desc}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                  background: stage === s.value ? 'var(--color-primary)' : 'transparent',
                  color: stage === s.value ? 'white' : 'var(--color-text-secondary)',
                  boxShadow: stage === s.value ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            </React.Fragment>
          ))}
        </div>
        {stage !== 'all' && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>
            {STAGES.find(s => s.value === stage)?.desc}
          </p>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={c === category ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<MessageSquare size={24} />} title="No questions in this category" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((q, i) => {
            const stageConfig = STAGES.find(s => s.value === q.stage);
            return (
              <div key={q.id} className="card animate-fade-in" style={{ padding: 18, animationDelay: `${i * 40}ms` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {q.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {stageConfig?.label ?? q.stage}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getDifficultyColor(q.difficulty), background: `${getDifficultyColor(q.difficulty)}18`, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {capitalize(q.difficulty)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.55, marginBottom: 12 }}>
                      {q.questionText}
                    </p>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-primary)' }}
                      onClick={() => alert('Answer practice will be integrated with the RecallOS revision engine.')}
                    >
                      Practice Answer →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
