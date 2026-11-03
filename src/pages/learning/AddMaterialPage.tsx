import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Sparkles, CheckCircle, FileUp } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { materialService } from '@/services/materialService';
import { extractPdfText } from '@/lib/pdf';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = ['Computer Networks', 'OOP', 'DBMS', 'Operating Systems', 'DSA', 'React', 'SQL', 'Java', 'Python', 'Mathematics', 'Other'];

type Status = 'idle' | 'saving' | 'extracting' | 'done' | 'error';

export default function AddMaterialPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const content = watch('content', '');
  React.useEffect(() => {
    setWordCount(content ? content.trim().split(/\s+/).filter(Boolean).length : 0);
  }, [content]);

  // PDF import: extract the text layer in the browser and drop it into Content,
  // then the normal "Save & Extract Topics" flow runs on it unchanged.
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'reading' | 'done' | 'error'>('idle');
  const [pdfMsg, setPdfMsg] = useState('');

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be re-selected later
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfStatus('error'); setPdfMsg('Please choose a PDF file.'); return;
    }
    setPdfStatus('reading'); setPdfMsg('');
    try {
      const { text, pages } = await extractPdfText(file);
      if (text.trim().length < 40) {
        setPdfStatus('error');
        setPdfMsg('This PDF has little or no selectable text (it may be scanned/image-only). Try a text-based PDF or paste the content.');
        return;
      }
      setValue('content', text, { shouldValidate: true });
      if (!getValues('title')) {
        setValue('title', file.name.replace(/\.pdf$/i, '').slice(0, 120), { shouldValidate: true });
      }
      setPdfStatus('done');
      setPdfMsg(`Loaded ${text.length.toLocaleString()} characters from ${pages} page${pages > 1 ? 's' : ''}. Review the content below, then extract topics.`);
    } catch {
      setPdfStatus('error');
      setPdfMsg('Could not read this PDF. Try another file or paste the text.');
    }
  };

  const onSubmit = async (data: FormData) => {
    setStatus('saving');
    setErrorMsg('');
    try {
      const mat = await materialService.create(data);
      setStatus('extracting');
      await materialService.extractTopics(mat.id);
      setStatus('done');
      setTimeout(() => navigate(`/learning/${mat.id}`), 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <AppShell title="Add Learning Material" breadcrumb="Learn / Learning Inbox">
      <PageHeader
        title="Add Learning Material"
        subtitle="Save your study notes, textbook content, or lecture material."
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/learning')}>
            <ArrowLeft size={14} /> Back
          </button>
        }
      />

      <div style={{ maxWidth: 700 }}>
        {status === 'done' ? (
          <div className="card animate-scale-in" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-success-soft)', color: 'var(--color-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle size={28} />
            </div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Topics Extracted Successfully!</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Redirecting to your material...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card animate-fade-in" style={{ padding: 24 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. TCP/IP Networking Fundamentals"
                className={`form-input ${errors.title ? 'error' : ''}`}
                {...register('title')}
              />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Category *</label>
              <select
                id="category"
                className={`form-input ${errors.category ? 'error' : ''}`}
                style={{ cursor: 'pointer' }}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="form-error">{errors.category.message}</span>}
            </div>

            {/* PDF import */}
            <div className="form-group">
              <label className="form-label">Import from PDF (optional)</label>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={handlePdf} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileRef.current?.click()}
                  disabled={pdfStatus === 'reading' || status === 'saving' || status === 'extracting'}
                  id="upload-pdf-btn"
                >
                  <FileUp size={15} /> {pdfStatus === 'reading' ? 'Reading PDF...' : 'Upload PDF & auto-fill'}
                </button>
                {pdfStatus === 'done' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 500 }}>{pdfMsg}</span>
                )}
                {pdfStatus === 'error' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{pdfMsg}</span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                The text is extracted in your browser and fills the Content box — then it runs the same topic extraction. Scanned / image-only PDFs won't work (no OCR).
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" htmlFor="content" style={{ margin: 0 }}>Content *</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{wordCount} words</span>
              </div>
              <textarea
                id="content"
                rows={12}
                placeholder="Paste or type your learning material here. The more detailed, the better the topic extraction."
                className={`form-input form-textarea ${errors.content ? 'error' : ''}`}
                {...register('content')}
              />
              {errors.content && <span className="form-error">{errors.content.message}</span>}
            </div>

            {/* Status messages */}
            {status === 'saving' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-info-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)', fontSize: '0.875rem', fontWeight: 500 }}>
                Saving your material...
              </div>
            )}
            {status === 'extracting' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-primary-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} />
                Analyzing your material and extracting topics...
              </div>
            )}
            {status === 'error' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-danger-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === 'saving' || status === 'extracting'}
                id="save-extract-btn"
              >
                <Sparkles size={16} />
                {status === 'saving' ? 'Saving...' : status === 'extracting' ? 'Extracting...' : 'Save & Extract Topics'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/learning')}
                disabled={status === 'saving' || status === 'extracting'}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
