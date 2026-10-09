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
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LandingPageNew = lazy(() => import("./pages/LandingPageNew"));
const LandingPageProfessional = lazy(() => import("./pages/LandingPageProfessional"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const PatientAuth = lazy(() => import("./pages/PatientAuth"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const PatientApp = lazy(() => import("./pages/PatientApp"));
const PatientMobileApp = lazy(() => import("./pages/PatientMobileApp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientDetail = lazy(() => import("./pages/PatientDetail"));
const NewPatient = lazy(() => import("./pages/NewPatient"));
const EditPatient = lazy(() => import("./pages/EditPatient"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Biblioteca = lazy(() => import("./pages/Biblioteca"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Profile = lazy(() => import("./pages/Profile"));
const GenerateMealPlan = lazy(() => import("./pages/GenerateMealPlan"));
const MealPlanView = lazy(() => import("./pages/MealPlanView"));
const Consultation = lazy(() => import("./pages/Consultation"));
const GroceryList = lazy(() => import("./pages/GroceryList"));
const PublicPatientPortal = lazy(() => import("./pages/PublicPatientPortal"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const SubscriptionExpired = lazy(() => import("./pages/SubscriptionExpired"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Sobre = lazy(() => import("./pages/Sobre"));
const ConsultationMealPlanEditor = lazy(() => import("./pages/Consultation"));
const PaidTrafficAgent = lazy(() => import("./pages/PaidTrafficAgent"));
const Blog = lazy(() => import("./pages/empresa/Blog").then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import("./pages/empresa/BlogPost").then(m => ({ default: m.BlogPost })));
const FAQ = lazy(() => import("./pages/empresa/FAQ").then(m => ({ default: m.FAQ })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {patientDomain ? (
                    <>
                      <Route path="/" element={<PatientMobileApp />} />
                      <Route path="/meu-app" element={<PatientMobileApp />} />
                      <Route path="/patient-auth" element={<PatientAuth />} />
                      <Route path="/portal/:patientId" element={<PatientPortal />} />
                      <Route path="*" element={<PatientMobileApp />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<LandingPageProfessional />} />
                      <Route path="/old" element={<LandingPage />} />
                      <Route path="/new" element={<LandingPageNew />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/patient-auth" element={<PatientAuth />} />
                      <Route path="/meu-app" element={<PatientMobileApp />} />
                      <Route
                        path="/dashboard"
                        element={
                          <AccountStatusGuard>
                            <Dashboard />
                          </AccountStatusGuard>
                        }
                      />
                      <Route path="/pacientes" element={<AccountStatusGuard><Patients /></AccountStatusGuard>} />
                      <Route path="/pacientes/:id" element={<AccountStatusGuard><PatientDetail /></AccountStatusGuard>} />
                      <Route path="/novo-paciente" element={<AccountStatusGuard><NewPatient /></AccountStatusGuard>} />
                      <Route path="/editar-paciente/:id" element={<AccountStatusGuard><EditPatient /></AccountStatusGuard>} />
                      <Route path="/agenda" element={<AccountStatusGuard><Agenda /></AccountStatusGuard>} />
                      <Route path="/biblioteca" element={<AccountStatusGuard><Biblioteca /></AccountStatusGuard>} />
                      <Route path="/financeiro" element={<AccountStatusGuard><Financeiro /></AccountStatusGuard>} />
                      <Route path="/perfil" element={<AccountStatusGuard><Profile /></AccountStatusGuard>} />
                      <Route path="/gerar-cardapio/:patientId" element={<AccountStatusGuard><GenerateMealPlan /></AccountStatusGuard>} />
                      <Route path="/cardapio/:mealPlanId" element={<AccountStatusGuard><MealPlanView /></AccountStatusGuard>} />
                      <Route path="/consulta/:patientId" element={<AccountStatusGuard><Consultation /></AccountStatusGuard>} />
                      <Route path="/lista-compras/:mealPlanId" element={<AccountStatusGuard><GroceryList /></AccountStatusGuard>} />
                      <Route path="/trafego-pago" element={<AccountStatusGuard><PaidTrafficAgent /></AccountStatusGuard>} />
                      <Route path="/admin" element={<AccountStatusGuard><Admin /></AccountStatusGuard>} />
                      <Route path="/subscription-expired" element={<SubscriptionExpired />} />
                      <Route path="/portal/:patientId" element={<PublicPatientPortal />} />
                      <Route path="/termos" element={<Termos />} />
                      <Route path="/privacidade" element={<Privacidade />} />
                      <Route path="/sobre" element={<Sobre />} />
                      <Route path="/empresa/blog" element={<Blog />} />
                      <Route path="/empresa/blog/:slug" element={<BlogPost />} />
                      <Route path="/empresa/faq" element={<FAQ />} />
                      <Route path="/acesso-negado" element={<AccessDenied />} />
                      <Route path="*" element={<NotFound />} />
                    </>
                  )}
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
