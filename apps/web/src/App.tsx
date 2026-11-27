import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { LoadingState } from './components/ui';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

import {
  AboutPage,
  FeaturesPage,
  LandingPage,
  PrivacyPage,
  TermsPage,
} from './pages/public/PublicPages';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from './pages/auth/AuthPages';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { DashboardPage } from './pages/user/DashboardPage';

const DailyPracticePage = lazy(() =>
  import('./pages/user/PracticePages').then((m) => ({ default: m.DailyPracticePage })),
);
const TopicDrillingPage = lazy(() =>
  import('./pages/user/PracticePages').then((m) => ({ default: m.TopicDrillingPage })),
);
const PracticeConfigPage = lazy(() =>
  import('./pages/user/PracticePages').then((m) => ({ default: m.PracticeConfigPage })),
);
const QuestionPracticePage = lazy(() =>
  import('./pages/user/PracticePages').then((m) => ({ default: m.QuestionPracticePage })),
);

const CatSimulationSetupPage = lazy(() =>
  import('./pages/user/CatSimulationPages').then((m) => ({ default: m.CatSimulationSetupPage })),
);
const CatExamRunnerPage = lazy(() =>
  import('./pages/user/CatSimulationPages').then((m) => ({ default: m.CatExamRunnerPage })),
);
const ExamResultsPage = lazy(() =>
  import('./pages/user/CatSimulationPages').then((m) => ({ default: m.ExamResultsPage })),
);

const WeaknessAnalyticsPage = lazy(() =>
  import('./pages/user/WeaknessAnalyticsPage').then((m) => ({ default: m.WeaknessAnalyticsPage })),
);

const ErrorNotebookPage = lazy(() =>
  import('./pages/user/LearningToolsPages').then((m) => ({ default: m.ErrorNotebookPage })),
);
const FlashcardsPage = lazy(() =>
  import('./pages/user/LearningToolsPages').then((m) => ({ default: m.FlashcardsPage })),
);
const StudyMaterialsPage = lazy(() =>
  import('./pages/user/LearningToolsPages').then((m) => ({ default: m.StudyMaterialsPage })),
);
const StudyPlannerPage = lazy(() =>
  import('./pages/user/LearningToolsPages').then((m) => ({ default: m.StudyPlannerPage })),
);

const AchievementsPage = lazy(() =>
  import('./pages/user/CommunityAndAccountPages').then((m) => ({ default: m.AchievementsPage })),
);
const LeaderboardPage = lazy(() =>
  import('./pages/user/CommunityAndAccountPages').then((m) => ({ default: m.LeaderboardPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/user/CommunityAndAccountPages').then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import('./pages/user/CommunityAndAccountPages').then((m) => ({ default: m.SettingsPage })),
);

const SubscriptionPage = lazy(() =>
  import('./pages/user/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })),
);
const PartnerVoucherPage = lazy(() =>
  import('./pages/partner/PartnerVoucherPage').then((m) => ({ default: m.PartnerVoucherPage })),
);

const LiveAkbarDiscoveryPage = lazy(() =>
  import('./pages/live/LiveAkbarDiscoveryPages').then((m) => ({ default: m.LiveAkbarDiscoveryPage })),
);
const LiveAkbarDetailPage = lazy(() =>
  import('./pages/live/LiveAkbarDiscoveryPages').then((m) => ({ default: m.LiveAkbarDetailPage })),
);
const MyLiveEventsPage = lazy(() =>
  import('./pages/live/LiveAkbarDiscoveryPages').then((m) => ({ default: m.MyLiveEventsPage })),
);
const WaitingRoomPage = lazy(() =>
  import('./pages/live/LiveAkbarWaitingRoomPage').then((m) => ({ default: m.WaitingRoomPage })),
);
const LiveCatExamPage = lazy(() =>
  import('./pages/live/LiveAkbarExamPage').then((m) => ({ default: m.LiveCatExamPage })),
);
const LiveEventLeaderboardPage = lazy(() =>
  import('./pages/live/LiveAkbarResultPages').then((m) => ({ default: m.LiveEventLeaderboardPage })),
);
const LiveEventResultPage = lazy(() =>
  import('./pages/live/LiveAkbarResultPages').then((m) => ({ default: m.LiveEventResultPage })),
);
const LiveEventReviewPage = lazy(() =>
  import('./pages/live/LiveAkbarResultPages').then((m) => ({ default: m.LiveEventReviewPage })),
);

const AdminLiveEventsListPage = lazy(() =>
  import('./pages/admin/AdminLiveAkbarPages').then((m) => ({ default: m.AdminLiveEventsListPage })),
);
const AdminLiveEventControlPage = lazy(() =>
  import('./pages/admin/AdminLiveAkbarPages').then((m) => ({ default: m.AdminLiveEventControlPage })),
);

const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminDashboardPage })),
);
const QuestionManagementPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.QuestionManagementPage })),
);
const QuestionEditorPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.QuestionEditorPage })),
);
const TopicManagementPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.TopicManagementPage })),
);
const TopicQuestionsReviewPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.TopicQuestionsReviewPage })),
);
const ReportManagementPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.ReportManagementPage })),
);
const SubscriptionManagementPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.SubscriptionManagementPage })),
);
const UserManagementPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.UserManagementPage })),
);
const ExamAndScoringConfigPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.ExamAndScoringConfigPage })),
);
const QualityReviewPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.QualityReviewPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <LoadingState label="Memuat halaman..." />
    </div>
  );
}

function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRoles,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: Array<'USER' | 'CONTENT_PARTNER' | 'HOST_OPERATOR' | 'EVENT_ADMIN' | 'ADMIN'>;
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <LoadingState label="Memverifikasi sesi Anda..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated User */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/daily-practice" element={<ProtectedRoute><DailyPracticePage /></ProtectedRoute>} />
              <Route path="/topics" element={<ProtectedRoute><TopicDrillingPage /></ProtectedRoute>} />
              <Route path="/practice/topic/:topicSlug" element={<ProtectedRoute><PracticeConfigPage /></ProtectedRoute>} />
              <Route path="/practice/session/:sessionId" element={<ProtectedRoute><QuestionPracticePage /></ProtectedRoute>} />
              <Route path="/cat-simulation" element={<ProtectedRoute><CatSimulationSetupPage /></ProtectedRoute>} />
              <Route path="/cat-simulation/run/:examId" element={<ProtectedRoute><CatExamRunnerPage /></ProtectedRoute>} />
              <Route path="/exam-results/:examId" element={<ProtectedRoute><ExamResultsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><WeaknessAnalyticsPage /></ProtectedRoute>} />
              <Route path="/ai-tutor" element={<Navigate to="/dashboard" replace />} />
              <Route path="/planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
              <Route path="/error-notebook" element={<ProtectedRoute><ErrorNotebookPage /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
              <Route path="/materials" element={<ProtectedRoute><StudyMaterialsPage /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route
                path="/partner/voucher"
                element={
                  <ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}>
                    <PartnerVoucherPage />
                  </ProtectedRoute>
                }
              />

              {/* Nippia Live Akbar */}
              <Route path="/live-events" element={<ProtectedRoute><LiveAkbarDiscoveryPage /></ProtectedRoute>} />
              <Route path="/live-events/my-events" element={<ProtectedRoute><MyLiveEventsPage /></ProtectedRoute>} />
              <Route path="/live-events/:eventId" element={<ProtectedRoute><LiveAkbarDetailPage /></ProtectedRoute>} />
              <Route path="/live-events/:eventId/waiting-room" element={<ProtectedRoute><WaitingRoomPage /></ProtectedRoute>} />
              <Route path="/live-events/:eventId/exam" element={<ProtectedRoute><LiveCatExamPage /></ProtectedRoute>} />
              <Route path="/live-events/:eventId/result" element={<ProtectedRoute><LiveEventResultPage /></ProtectedRoute>} />
              <Route path="/live-events/:eventId/leaderboard" element={<ProtectedRoute><LiveEventLeaderboardPage /></ProtectedRoute>} />
              <Route path="/live-events/:eventId/review" element={<ProtectedRoute><LiveEventReviewPage /></ProtectedRoute>} />

              {/* Admin & Live Event Operators */}
              <Route
                path="/admin/live-events"
                element={
                  <ProtectedRoute allowedRoles={['HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN']}>
                    <AdminLiveEventsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/live-events/:eventId"
                element={
                  <ProtectedRoute allowedRoles={['HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN']}>
                    <AdminLiveEventControlPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}><QuestionManagementPage /></ProtectedRoute>} />
              <Route path="/admin/questions/new" element={<ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}><QuestionEditorPage /></ProtectedRoute>} />
              <Route path="/admin/questions/:id/edit" element={<ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}><QuestionEditorPage /></ProtectedRoute>} />
              <Route path="/admin/ai-generator" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/topics" element={<ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}><TopicManagementPage /></ProtectedRoute>} />
              <Route path="/admin/topics/:topicSlug" element={<ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}><TopicQuestionsReviewPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['CONTENT_PARTNER', 'ADMIN']}><ReportManagementPage /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute adminOnly><SubscriptionManagementPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
              <Route path="/admin/configs" element={<ProtectedRoute adminOnly><ExamAndScoringConfigPage /></ProtectedRoute>} />
              <Route path="/admin/quality" element={<ProtectedRoute adminOnly><QualityReviewPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
