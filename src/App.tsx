import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AccountStatusGuard } from "@/components/AccountStatusGuard";
import { Loader2 } from "lucide-react";

// Lazy load all pages for zero-latency SPA navigation
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const PatientAuth = lazy(() => import("./pages/PatientAuth"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const PatientApp = lazy(() => import("./pages/PatientApp"));
const PatientMobileApp = lazy(() => import("./pages/PatientMobileApp"));
const PublicPatientPortal = lazy(() => import("./pages/PublicPatientPortal"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewPatient = lazy(() => import("./pages/NewPatient"));
const EditPatient = lazy(() => import("./pages/EditPatient"));
const PatientDetail = lazy(() => import("./pages/PatientDetail"));
const GenerateMealPlan = lazy(() => import("./pages/GenerateMealPlan"));
const MealPlanView = lazy(() => import("./pages/MealPlanView"));
const GroceryList = lazy(() => import("./pages/GroceryList"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const SubscriptionExpired = lazy(() => import("./pages/SubscriptionExpired"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Consultation = lazy(() => import("./pages/Consultation"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Patients = lazy(() => import("./pages/Patients"));
const Biblioteca = lazy(() => import("./pages/Biblioteca"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Termos = lazy(() => import("./pages/Termos"));
const Sobre = lazy(() => import("./pages/Sobre"));

// Global loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Carregando...</p>
      </div>
    </div>
  );
}

// Optimized QueryClient with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Check if we're on the patient subdomain
const isPatientSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname === 'paciente.nutriflow.inf.br' || hostname.startsWith('paciente.');
};

function App() {
  const patientDomain = isPatientSubdomain();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AccountStatusGuard>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* If on patient subdomain, show PatientAuth as landing page */}
                    <Route path="/" element={patientDomain ? <PatientAuth /> : <Index />} />
                    <Route path="/privacidade" element={<Privacidade />} />
                    <Route path="/termos" element={<Termos />} />
                    <Route path="/sobre" element={<Sobre />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/patient-auth" element={<PatientAuth />} />
                    <Route path="/patient-portal" element={<PatientPortal />} />
                    <Route path="/meu-app" element={<PatientMobileApp />} />
                    <Route path="/app/:patientId" element={<PatientApp />} />
                    <Route path="/paciente/:patientId" element={<PublicPatientPortal />} />
                    <Route path="/access-denied" element={<AccessDenied />} />
                    <Route path="/subscription-expired" element={<SubscriptionExpired />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/consulta" element={<Consultation />} />
                    <Route path="/consulta/:patientId" element={<Consultation />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/biblioteca" element={<Biblioteca />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/patients/new" element={<NewPatient />} />
                    <Route path="/patients/:id" element={<PatientDetail />} />
                    <Route path="/patients/:id/edit" element={<EditPatient />} />
                    <Route path="/patients/:id/meal-plan/generate" element={<GenerateMealPlan />} />
                    <Route path="/patients/:id/meal-plan/:planId" element={<MealPlanView />} />
                    <Route path="/patients/:id/meal-plan/:planId/grocery-list" element={<GroceryList />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AccountStatusGuard>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
