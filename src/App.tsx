import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/contexts/I18nContext";
import FloatingJoinCTA from "./components/FloatingJoinCTA";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import JoinPage from "./pages/JoinPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import UrgentPage from "./pages/UrgentPage.tsx";
import DonorProfilePage from "./pages/DonorProfilePage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <FloatingJoinCTA />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/urgent" element={<UrgentPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/profile" element={<DonorProfilePage />} />
              {/* Stealth admin — hidden route */}
              <Route path="/nasrullah-admin-bmc-2026" element={<DashboardPage />} />
              {/* Public /dashboard redirects to home */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  </ErrorBoundary>
);

export default App;
