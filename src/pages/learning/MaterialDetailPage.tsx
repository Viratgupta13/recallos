import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Play, Tag, Calendar, FileText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { materialService } from '@/services/materialService';
import { questionService } from '@/services/questionService';
import type { LearningMaterial, Question } from '@/types';
import { formatDate, getDifficultyColor, capitalize } from '@/lib/utils';

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [m, qs] = await Promise.all([
          materialService.getById(id),
          questionService.getAll(),
        ]);
        setMaterial(m);
        setQuestions(qs.filter(q => q.materialId === id));
      } catch {
        setError('Failed to load material.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (error) return (
    <AppShell title="Material Detail">
      <ErrorState message={error} onRetry={() => navigate('/learning')} />
    </AppShell>
  );

  if (loading) return (
    <AppShell title="Learning Material">
      <div className="card" style={{ padding: 24 }}>
        <LoadingSkeleton lines={8} />
      </div>
    </AppShell>
  );

  if (!material) return null;

  return (
    <AppShell title={material.title} breadcrumb="Learn / Learning Inbox">
      <PageHeader
        title={material.title}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/learning')}>
              <ArrowLeft size={14} /> Back
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/learning/${id}?edit=true`)}>
              <Edit size={14} /> Edit
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/revision')}>
              <Play size={14} /> Practice Recall
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className="material-detail-grid">
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card animate-fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={13} style={{ color: 'var(--color-secondary)' }} />
                <span style={{
                  fontSize: '0.8rem', fontWeight: 600,
                  background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)',
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                }}>{material.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                <Calendar size={13} />
                Created {formatDate(material.createdAt)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                <FileText size={13} />
                {material.wordCount} words
              </div>
            </div>

            <div style={{
              background: 'var(--color-surface-alt)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
              lineHeight: 1.75,
              fontSize: '0.9rem',
              color: 'var(--color-text)',
              whiteSpace: 'pre-wrap',
            }}>
              {material.content}
            </div>
          </div>

          {/* Related Questions */}
          {questions.length > 0 && (
            <div className="card animate-fade-in" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 14 }}>
                Related Questions ({questions.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questions.map(q => (
                  <div key={q.id} style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 6 }}>
                          {q.questionText}
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: '0.7rem', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '1px 7px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                            {q.type}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '1px 7px', borderRadius: 'var(--radius-full)', background: `${getDifficultyColor(q.difficulty)}20`, color: getDifficultyColor(q.difficulty) }}>
                            {capitalize(q.difficulty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card animate-fade-in" style={{ padding: 18 }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Material Info</h4>
            {[
              { label: 'Category', value: material.category },
              { label: 'Word Count', value: material.wordCount.toLocaleString() },
              { label: 'Topics', value: material.topicCount },
              { label: 'Extraction', value: material.extractionStatus, color: material.extractionStatus === 'completed' ? 'var(--color-success)' : 'var(--color-warning)' },
              { label: 'Created', value: formatDate(material.createdAt) },
              { label: 'Updated', value: formatDate(material.updatedAt) },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: color || 'var(--color-text)' }}>{value}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/revision')} style={{ width: '100%' }}>
            <Play size={15} /> Practice Recall
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .material-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  );
}
