import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import DiscoverPage from "@/pages/DiscoverPage";
import BookDetailPage from "@/pages/BookDetailPage";
import LibraryPage from "@/pages/LibraryPage";
import JourneyPage from "@/pages/JourneyPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import QADiagnosticsPage from "@/pages/QADiagnosticsPage";
import AILiteraryStudioPage from "@/pages/AILiteraryStudioPage";
import AppLayout from "@/layouts/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user) as any;
  return user?.role === "ADMIN" ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ai-studio" element={<AILiteraryStudioPage />} />
          <Route path="/features" element={<AILiteraryStudioPage />} />
          <Route path="/literary-studio" element={<AILiteraryStudioPage />} />
          <Route path="/pace-coach" element={<AILiteraryStudioPage />} />
          <Route path="/quote-vault" element={<AILiteraryStudioPage />} />
          <Route path="/character-chat" element={<AILiteraryStudioPage />} />
          <Route path="/qa-diagnostics" element={<QADiagnosticsPage />} />
          <Route path="/testing" element={<QADiagnosticsPage />} />
          <Route path="/protection" element={<QADiagnosticsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/app/ai-studio" element={<AILiteraryStudioPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
