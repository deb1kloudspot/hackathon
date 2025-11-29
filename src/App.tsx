import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import DisputeManagementPage from "@/pages/dispute-management/DisputeManagementPage"; // Import the dispute page

// Initialize the query client for React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster /> {/* Toast notification setup */}
      <BrowserRouter>
        <Routes>
          {/* Route for login page */}
          <Route path="/" element={<Login />} />

          {/* Dashboard route, inside which we'll have nested routes */}
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Nested route for Dispute Management inside Dashboard */}
            <Route path="dispute-management" element={<DisputeManagementPage />} />
          </Route>

          {/* Fallback route for undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
