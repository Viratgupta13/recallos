import { useEffect, useState } from 'react';
import { HelpCircle, X, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { questionService } from '@/services/questionService';
import { topicService } from '@/services/topicService';
import { revisionService } from '@/services/revisionService';
import type { Question, Topic, RecallAttempt } from '@/types';
import { getDifficultyColor, capitalize } from '@/lib/utils';

const TYPES = ['All', 'conceptual', 'mcq', 'comparison', 'debugging', 'coding', 'explain-back'];
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard'];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  // Single-question practice (no session): grades via /recall/attempt, which
  // also advances the topic's spaced-repetition memory.
  const [practiceQ, setPracticeQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<RecallAttempt | null>(null);

  const openPractice = (q: Question) => { setPracticeQ(q); setAnswer(''); setResult(null); };
  const closePractice = () => { setPracticeQ(null); setAnswer(''); setResult(null); setGrading(false); };
  const checkAnswer = async () => {
    if (!practiceQ || !answer.trim() || grading) return;
    setGrading(true);
    try {
      const att = await revisionService.submitAnswer({ sessionId: '', questionId: practiceQ.id, topicId: practiceQ.topicId, userAnswer: answer });
      setResult(att);
    } catch { /* leave result null; user can retry */ }
    finally { setGrading(false); }
  };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [q, t] = await Promise.all([questionService.getAll(), topicService.getAll()]);
      setQuestions(q); setTopics(t);
    } catch { setError('Failed to load questions.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const getTopicName = (id: string) => topics.find(t => t.id === id)?.name ?? id;

  const filtered = questions.filter(q => {
    const ms = search === '' || q.questionText.toLowerCase().includes(search.toLowerCase()) || getTopicName(q.topicId).toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === 'All' || q.type === typeFilter;
    const md = diffFilter === 'All' || q.difficulty === diffFilter;
    return ms && mt && md;
  });

  if (error) return <AppShell title="Question Bank"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Question Bank" breadcrumb="Learn">
      <PageHeader title="Question Bank" subtitle="All questions extracted from your learning materials." />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search questions..." id="question-search" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={t === typeFilter ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
              {capitalize(t)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDiffFilter(d)} className={d === diffFilter ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
              {capitalize(d)}
            </button>
          ))}
        </div>
      </div>

      <div className="card animate-fade-in" style={{ overflow: 'hidden' }}>
        {loading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)' }}>
                {['Question', 'Topic', 'Type', 'Difficulty', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<HelpCircle size={24} />} title="No questions found" description="Add learning materials to auto-generate questions." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)' }}>
                {['Question', 'Topic', 'Type', 'Difficulty', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr key={q.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-alt)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--color-text)', maxWidth: 400 }}>
                    {q.questionText}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {q.concepts.slice(0, 3).map(c => (
                        <span key={c} style={{ fontSize: '0.625rem', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8375rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {getTopicName(q.topicId)}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {q.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getDifficultyColor(q.difficulty), background: `${getDifficultyColor(q.difficulty)}18`, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {capitalize(q.difficulty)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => openPractice(q)}>
                      <Sparkles size={13} /> Practice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Practice modal */}
      {practiceQ && (
        <div
          onClick={closePractice}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card animate-scale-in"
            style={{ width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', padding: 24 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{getTopicName(practiceQ.topicId)}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getDifficultyColor(practiceQ.difficulty), background: `${getDifficultyColor(practiceQ.difficulty)}18`, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{capitalize(practiceQ.difficulty)}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closePractice} style={{ padding: 4 }}><X size={16} /></button>
            </div>

            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 16 }}>{practiceQ.questionText}</h3>

            {!result ? (
              <>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here. Be as detailed as you can..."
                  rows={5}
                  style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-text)', fontSize: '0.875rem', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{answer.trim() ? `${answer.trim().split(/\s+/).length} words` : 'No LLM — graded on concept coverage'}</span>
                  <button className="btn btn-primary" onClick={checkAnswer} disabled={!answer.trim() || grading}>
                    <Sparkles size={15} /> {grading ? 'Checking...' : 'Check Answer'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Score */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recall Score</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, color: result.recallScore >= 70 ? 'var(--color-success)' : result.recallScore >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{result.recallScore}%</div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{result.feedback}</p>
                </div>

                {/* Concepts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', marginBottom: 6 }}><CheckCircle size={13} /> Remembered</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {result.rememberedConcepts.length ? result.rememberedConcepts.map(c => (
                        <span key={c} style={{ fontSize: '0.7rem', background: 'var(--color-success-soft)', color: 'var(--color-success)', padding: '2px 7px', borderRadius: 4 }}>{c}</span>
                      )) : <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>—</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: 6 }}><XCircle size={13} /> Missing</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {result.missingConcepts.length ? result.missingConcepts.map(c => (
                        <span key={c} style={{ fontSize: '0.7rem', background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '2px 7px', borderRadius: 4 }}>{c}</span>
                      )) : <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>—</span>}
                    </div>
                  </div>
                </div>

                {/* Expected answer */}
                <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Reference Answer</div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: 1.5 }}>{practiceQ.expectedAnswer}</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setResult(null); setAnswer(''); }}>Try Again</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={closePractice}>Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
