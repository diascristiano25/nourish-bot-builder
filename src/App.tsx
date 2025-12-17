import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AccountStatusGuard } from "@/components/AccountStatusGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientAuth from "./pages/PatientAuth";
import PatientPortal from "./pages/PatientPortal";
import PatientApp from "./pages/PatientApp";
import Dashboard from "./pages/Dashboard";
import NewPatient from "./pages/NewPatient";
import EditPatient from "./pages/EditPatient";
import PatientDetail from "./pages/PatientDetail";
import GenerateMealPlan from "./pages/GenerateMealPlan";
import MealPlanView from "./pages/MealPlanView";
import GroceryList from "./pages/GroceryList";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";
import Consultation from "./pages/Consultation";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Patients from "./pages/Patients";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AccountStatusGuard>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/patient-auth" element={<PatientAuth />} />
                <Route path="/patient-portal" element={<PatientPortal />} />
                <Route path="/app/:patientId" element={<PatientApp />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/consulta" element={<Consultation />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/patients/new" element={<NewPatient />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/patients/:id/edit" element={<EditPatient />} />
                <Route path="/patients/:id/meal-plan/generate" element={<GenerateMealPlan />} />
                <Route path="/patients/:id/meal-plan/:planId" element={<MealPlanView />} />
                <Route path="/patients/:id/meal-plan/:planId/grocery-list" element={<GroceryList />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AccountStatusGuard>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
