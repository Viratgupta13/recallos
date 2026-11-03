import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Loader2 } from 'lucide-react';
import { revisionService } from '@/services/revisionService';
import { useRevisionStore } from '@/stores/revisionStore';
import type { Question, Topic, RecallAttempt } from '@/types';
import { getDifficultyColor, capitalize } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface SessionQuestion {
  question: Question;
  topic: Topic;
}

export default function RevisionSessionPage() {
  const navigate = useNavigate();
  const {
    currentSession, currentQuestionIndex,
    nextQuestion, addAttempt, setEvaluating, isEvaluating,
    completeSession, resetSession,
  } = useRevisionStore();

  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<RecallAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSession) { navigate('/revision'); return; }
    revisionService.getSessionQuestions(currentSession.id)
      .then(qs => setSessionQuestions(qs as SessionQuestion[]))
      .catch(() => navigate('/revision'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="revision-session-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: 12 }}><Loader2 size={32} className="spin" /></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading your revision...</p>
      </div>
    </div>
  );

  // Handled via the useEffect redirect above - render null while loading
  if (!loading && (!currentSession || sessionQuestions.length === 0)) {
    return null;
  }

  const currentSQ = sessionQuestions[currentQuestionIndex];
  const totalQuestions = sessionQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const handleSubmit = async () => {
    if (!answer.trim() || !currentSession) return;
    setEvaluating(true);
    try {
      const attempt = await revisionService.submitAnswer({
        sessionId: currentSession.id,
        questionId: currentSQ.question.id,
        topicId: currentSQ.topic.id,
        userAnswer: answer,
      });
      addAttempt(attempt);
      setFeedback(attempt);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      completeSession();
      navigate('/revision/result');
    } else {
      nextQuestion();
      setAnswer('');
      setFeedback(null);
    }
  };

  const handleExit = () => {
    if (confirm('Exit revision session? Progress will be lost.')) {
      resetSession();
      navigate('/revision');
    }
  };

  const scoreColor = feedback
    ? feedback.recallScore >= 80 ? 'var(--color-success)' : feedback.recallScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
    : 'var(--color-primary)';

  return (
    <div className="revision-session-container">
      {/* Header */}
      <div style={{
        padding: '14px 24px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button className="btn btn-ghost btn-sm" onClick={handleExit} aria-label="Exit session">
          <X size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} color="var(--color-primary)" height={5} animated />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 24px', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        {/* Topic & Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{
            fontSize: '0.8rem', fontWeight: 600,
            background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)',
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
          }}>
            {currentSQ.topic.name}
          </span>
          <span style={{
            fontSize: '0.8rem', fontWeight: 600,
            color: getDifficultyColor(currentSQ.question.difficulty),
            background: `${getDifficultyColor(currentSQ.question.difficulty)}18`,
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
          }}>
            {capitalize(currentSQ.question.difficulty)}
          </span>
          <span style={{
            fontSize: '0.75rem', color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-alt)', padding: '4px 10px', borderRadius: 'var(--radius-full)',
          }}>
            {currentSQ.question.type}
          </span>
        </div>

        {/* Question */}
        <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.55, color: 'var(--color-text)' }}>
            {currentSQ.question.questionText}
          </h2>
        </div>

        {/* MCQ options */}
        {currentSQ.question.type === 'mcq' && currentSQ.question.options ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {currentSQ.question.options.map((opt, i) => (
              <label key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${answer === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: answer === opt ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
                <input
                  type="radio"
                  name="mcq-answer"
                  value={opt}
                  checked={answer === opt}
                  onChange={e => setAnswer(e.target.value)}
                  disabled={!!feedback}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          /* Text answer */
          !feedback && (
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="answer-textarea">Your Answer</label>
              <textarea
                id="answer-textarea"
                rows={6}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here. Be as detailed as you can..."
                className="form-input form-textarea"
                style={{ fontSize: '0.9rem' }}
                disabled={isEvaluating}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          )
        )}

        {/* Evaluating state */}
        {isEvaluating && (
          <div className="card animate-fade-in" style={{ padding: 24, textAlign: 'center', marginBottom: 20, background: 'var(--color-primary-soft)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--color-primary)' }}>
              <Loader2 size={20} className="spin" />
              <span style={{ fontWeight: 600 }}>Evaluating your recall...</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>
              Analyzing your answer against key concepts
            </p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="card animate-scale-in" style={{ padding: 24, marginBottom: 20, border: `1px solid ${scoreColor}30` }}>
            {/* Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: `4px solid ${scoreColor}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                  {feedback.recallScore}%
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Recall</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Recall Score</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  {feedback.feedback}
                </p>
              </div>
            </div>

            {/* Concepts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {feedback.rememberedConcepts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    ✓ Concepts Remembered
                  </div>
                  {feedback.rememberedConcepts.map(c => (
                    <div key={c} style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--color-success-soft)', borderRadius: 6, color: 'var(--color-success)', marginBottom: 4 }}>{c}</div>
                  ))}
                </div>
              )}
              {feedback.missingConcepts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: 6 }}>
                    ✗ Missing Concepts
                  </div>
                  {feedback.missingConcepts.map(c => (
                    <div key={c} style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--color-danger-soft)', borderRadius: 6, color: 'var(--color-danger)', marginBottom: 4 }}>{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!feedback && !isEvaluating && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!answer.trim() || isEvaluating}
              id="submit-answer-btn"
            >
              Submit Answer
            </button>
          )}
          {feedback && (
            <button className="btn btn-primary" onClick={handleNext} id="next-question-btn">
              {isLastQuestion ? 'View Results' : 'Next Question'}
              <ChevronRight size={16} />
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleExit}>
            Exit Session
          </button>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
