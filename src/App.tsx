import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Auth pages (eager load)
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// App pages (lazy load)
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const LearningInboxPage = lazy(() => import('@/pages/learning/LearningInboxPage'));
const AddMaterialPage = lazy(() => import('@/pages/learning/AddMaterialPage'));
const MaterialDetailPage = lazy(() => import('@/pages/learning/MaterialDetailPage'));
const TopicsPage = lazy(() => import('@/pages/topics/TopicsPage'));
const TopicDetailPage = lazy(() => import('@/pages/topics/TopicDetailPage'));
const QuestionBankPage = lazy(() => import('@/pages/questions/QuestionBankPage'));
const TodayRevisionPage = lazy(() => import('@/pages/revision/TodayRevisionPage'));
const RevisionSessionPage = lazy(() => import('@/pages/revision/RevisionSessionPage'));
const RevisionResultPage = lazy(() => import('@/pages/revision/RevisionResultPage'));
const RevisionHistoryPage = lazy(() => import('@/pages/revision/RevisionHistoryPage'));
const MemoryPage = lazy(() => import('@/pages/memory/MemoryPage'));
const ForgettingRadarPage = lazy(() => import('@/pages/analytics/ForgettingRadarPage'));
const KnowledgeHealthPage = lazy(() => import('@/pages/analytics/KnowledgeHealthPage'));
const PlacementPage = lazy(() => import('@/pages/placement/PlacementPage'));
const InterviewPage = lazy(() => import('@/pages/interview/InterviewPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          <Route path="/learning" element={<ProtectedRoute><LearningInboxPage /></ProtectedRoute>} />
          <Route path="/learning/new" element={<ProtectedRoute><AddMaterialPage /></ProtectedRoute>} />
          <Route path="/learning/:id" element={<ProtectedRoute><MaterialDetailPage /></ProtectedRoute>} />

          <Route path="/topics" element={<ProtectedRoute><TopicsPage /></ProtectedRoute>} />
          <Route path="/topics/:id" element={<ProtectedRoute><TopicDetailPage /></ProtectedRoute>} />

          <Route path="/questions" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />

          <Route path="/revision" element={<ProtectedRoute><TodayRevisionPage /></ProtectedRoute>} />
          <Route path="/revision/session" element={<ProtectedRoute><RevisionSessionPage /></ProtectedRoute>} />
          <Route path="/revision/result" element={<ProtectedRoute><RevisionResultPage /></ProtectedRoute>} />
          <Route path="/revision-history" element={<ProtectedRoute><RevisionHistoryPage /></ProtectedRoute>} />

          <Route path="/memory" element={<ProtectedRoute><MemoryPage /></ProtectedRoute>} />

          <Route path="/analytics" element={<ProtectedRoute><KnowledgeHealthPage /></ProtectedRoute>} />
          <Route path="/forgetting-radar" element={<ProtectedRoute><ForgettingRadarPage /></ProtectedRoute>} />

          <Route path="/placement" element={<ProtectedRoute><PlacementPage /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
