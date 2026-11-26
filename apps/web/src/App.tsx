import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { LoadingState } from './components/ui';

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
import {
  DailyPracticePage,
  PracticeConfigPage,
  QuestionPracticePage,
  TopicDrillingPage,
} from './pages/user/PracticePages';
import {
  CatExamRunnerPage,
  CatSimulationSetupPage,
  ExamResultsPage,
} from './pages/user/CatSimulationPages';
import { WeaknessAnalyticsPage } from './pages/user/WeaknessAnalyticsPage';
import {
  AiTutorPage,
  ErrorNotebookPage,
  FlashcardsPage,
  StudyMaterialsPage,
  StudyPlannerPage,
} from './pages/user/LearningToolsPages';
import {
  AchievementsPage,
  LeaderboardPage,
  ProfilePage,
  SettingsPage,
} from './pages/user/CommunityAndAccountPages';
import {
  AdminDashboardPage,
  AiGeneratorPage,
  ExamAndScoringConfigPage,
  QualityReviewPage,
  QuestionEditorPage,
  QuestionManagementPage,
  TopicManagementPage,
  UserManagementPage,
} from './pages/admin/AdminPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
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

  return <>{children}</>;
}

export function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
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
          <Route path="/ai-tutor" element={<ProtectedRoute><AiTutorPage /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
          <Route path="/error-notebook" element={<ProtectedRoute><ErrorNotebookPage /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><StudyMaterialsPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute adminOnly><QuestionManagementPage /></ProtectedRoute>} />
          <Route path="/admin/questions/new" element={<ProtectedRoute adminOnly><QuestionEditorPage /></ProtectedRoute>} />
          <Route path="/admin/questions/:id/edit" element={<ProtectedRoute adminOnly><QuestionEditorPage /></ProtectedRoute>} />
          <Route path="/admin/ai-generator" element={<ProtectedRoute adminOnly><AiGeneratorPage /></ProtectedRoute>} />
          <Route path="/admin/topics" element={<ProtectedRoute adminOnly><TopicManagementPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/configs" element={<ProtectedRoute adminOnly><ExamAndScoringConfigPage /></ProtectedRoute>} />
          <Route path="/admin/quality" element={<ProtectedRoute adminOnly><QualityReviewPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
