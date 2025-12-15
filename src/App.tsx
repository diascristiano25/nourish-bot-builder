import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewPatient from "./pages/NewPatient";
import PatientDetail from "./pages/PatientDetail";
import GenerateMealPlan from "./pages/GenerateMealPlan";
import MealPlanView from "./pages/MealPlanView";
import GroceryList from "./pages/GroceryList";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients/new" element={<NewPatient />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/patients/:id/meal-plan/generate" element={<GenerateMealPlan />} />
              <Route path="/patients/:id/meal-plan/:planId" element={<MealPlanView />} />
              <Route path="/patients/:id/meal-plan/:planId/grocery-list" element={<GroceryList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
