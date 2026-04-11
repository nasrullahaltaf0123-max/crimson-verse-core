import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FloatingJoinCTA from "./components/FloatingJoinCTA";
import Index from "./pages/Index.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import JoinPage from "./pages/JoinPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import UrgentPage from "./pages/UrgentPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingJoinCTA />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/urgent" element={<UrgentPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/dashboard" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
