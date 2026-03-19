import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BusinessPlan from "./pages/BusinessPlan";
import Tasks from "./pages/Tasks";
import Financial from "./pages/Financial";
import Investors from "./pages/Investors";
import Team from "./pages/Team";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
            <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <ErrorBoundary><Onboarding /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ErrorBoundary><Dashboard /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/business-plan" element={
              <ProtectedRoute>
                <ErrorBoundary><BusinessPlan /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <ErrorBoundary><Tasks /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/financial" element={
              <ProtectedRoute>
                <ErrorBoundary><Financial /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/investors" element={
              <ProtectedRoute>
                <ErrorBoundary><Investors /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <ErrorBoundary><Team /></ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <ErrorBoundary><Settings /></ErrorBoundary>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;