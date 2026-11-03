import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Eye, Edit, FileText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { materialService } from '@/services/materialService';
import type { LearningMaterial } from '@/types';
import { formatRelativeDate, truncate } from '@/lib/utils';

const categories = ['All', 'Computer Networks', 'OOP', 'DBMS', 'Operating Systems', 'DSA', 'React', 'SQL'];

export default function LearningInboxPage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setMaterials(await materialService.getAll()); }
    catch { setError('Failed to load materials.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = materials.filter(m => {
    const matchSearch = search === '' || m.title.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || m.category === category;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    setDeleting(id);
    try { await materialService.delete(id); setMaterials(m => m.filter(x => x.id !== id)); }
    catch { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const statusColors = { completed: 'var(--color-success)', processing: 'var(--color-warning)', pending: 'var(--color-text-muted)', failed: 'var(--color-danger)' };

  return (
    <AppShell title="Learning Inbox" breadcrumb="Learn">
      <PageHeader
        title="Learning Inbox"
        subtitle="Manage your learning materials and track topic extraction."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/learning/new')} id="add-material-btn">
            <Plus size={16} /> Add Material
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search materials..." id="material-search" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={c === category ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              id={`cat-filter-${c.toLowerCase().replace(/\s/g, '-')}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title={search || category !== 'All' ? 'No materials found' : 'No learning material yet'}
          description={search || category !== 'All' ? 'Try adjusting your search or filters.' : 'Add your first learning material to start building your knowledge base.'}
          action={(!search && category === 'All') ? (
            <button className="btn btn-primary" onClick={() => navigate('/learning/new')}>
              <Plus size={15} /> Add your first material
            </button>
          ) : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map(m => (
            <div key={m.id} className="card animate-fade-in" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--color-primary-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--color-primary)',
                }}>
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 2 }}>
                    {m.title}
                  </h3>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    background: 'var(--color-secondary-soft)',
                    color: 'var(--color-secondary)',
                    padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  }}>
                    {m.category}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {truncate(m.content, 120)}
              </p>

              <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <span>{m.wordCount} words</span>
                <span>·</span>
                <span style={{ color: statusColors[m.extractionStatus] }}>
                  {m.topicCount > 0 ? `${m.topicCount} topics` : m.extractionStatus}
                </span>
                <span>·</span>
                <span>{formatRelativeDate(m.updatedAt)}</span>
              </div>

              <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/learning/${m.id}`)}
                  style={{ flex: 1 }}
                  title="View material"
                >
                  <Eye size={13} /> View
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/learning/${m.id}?edit=true`)}
                  style={{ flex: 1 }}
                  title="Edit material"
                >
                  <Edit size={13} /> Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(m.id)}
                  disabled={deleting === m.id}
                  style={{ color: 'var(--color-danger)', flex: 1 }}
                  title="Delete material"
                >
                  <Trash2 size={13} /> {deleting === m.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
