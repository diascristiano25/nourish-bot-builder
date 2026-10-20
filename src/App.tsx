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
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const LgpdPage = lazy(() => import("./pages/LgpdPage"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const PatientAuth = lazy(() => import("./pages/PatientAuth"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const PatientApp = lazy(() => import("./pages/PatientApp"));
const PatientMobileApp = lazy(() => import("./pages/PatientMobileApp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModernDashboard = lazy(() => import("./pages/ModernDashboard"));
const Evolucao = lazy(() => import("./pages/Evolucao"));
const Mensagens = lazy(() => import("./pages/Mensagens"));
const MealPlanBuilderPage = lazy(() => import("./pages/MealPlanBuilderPage"));
const DashboardComparison = lazy(() => import("./pages/DashboardComparison"));
const DesignShowcase = lazy(() => import("./pages/DesignShowcase"));
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
const Sobre = lazy(() => import("./pages/Sobre"));
const TermosSuporte = lazy(() => import("./pages/suporte/Termos"));
const PrivacidadeSuporte = lazy(() => import("./pages/suporte/Privacidade"));
const ConsultationMealPlanEditor = lazy(() => import("./pages/Consultation"));
const PaidTrafficAgent = lazy(() => import("./pages/PaidTrafficAgent"));
const Recursos = lazy(() => import("./pages/empresa/Recursos"));
const Atendimento = lazy(() => import("./pages/recursos/Atendimento"));
const Prescricao = lazy(() => import("./pages/recursos/Prescricao"));
const Gestao = lazy(() => import("./pages/recursos/Gestao"));
const Blog = lazy(() => import("./pages/empresa/Blog"));
const BlogPost = lazy(() => import("./pages/empresa/BlogPost"));
const SobreEmpresa = lazy(() => import("./pages/empresa/Sobre"));
const Contato = lazy(() => import("./pages/suporte/Contato"));
const CentralAjuda = lazy(() => import("./pages/suporte/CentralAjuda"));
const Status = lazy(() => import("./pages/suporte/Status"));
const PatientProgress = lazy(() => import("./pages/PatientProgress"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const PatientMealPlan = lazy(() => import("./pages/PatientMealPlan"));
const Suporte = lazy(() => import("./pages/Suporte"));

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
                      <Route path="/paciente/:patientId" element={<PublicPatientPortal />} />
                      <Route path="*" element={<PatientMobileApp />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/old" element={<LandingPageProfessional />} />
                      <Route path="/new" element={<LandingPageNew />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/patient-auth" element={<PatientAuth />} />
                      <Route path="/meu-app" element={<PatientMobileApp />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/lgpd" element={<LgpdPage />} />
                      <Route
                        path="/dashboard"
                        element={
                          <AccountStatusGuard>
                            <ModernDashboard />
                          </AccountStatusGuard>
                        }
                      />
                      <Route
                        path="/modern-dashboard"
                        element={
                          <AccountStatusGuard>
                            <ModernDashboard />
                          </AccountStatusGuard>
                        }
                      />
                      <Route
                        path="/evolucao"
                        element={
                          <AccountStatusGuard>
                            <Evolucao />
                          </AccountStatusGuard>
                        }
                      />
                      <Route
                        path="/mensagens"
                        element={
                          <AccountStatusGuard>
                            <Mensagens />
                          </AccountStatusGuard>
                        }
                      />
                      <Route
                        path="/meal-plan-builder"
                        element={
                          <AccountStatusGuard>
                            <MealPlanBuilderPage />
                          </AccountStatusGuard>
                        }
                      />
                      <Route
                        path="/dashboard-comparison"
                        element={
                          <AccountStatusGuard>
                            <DashboardComparison />
                          </AccountStatusGuard>
                        }
                      />
                      <Route path="/design-showcase" element={<DesignShowcase />} />
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
                      <Route path="/paciente/:patientId" element={<PublicPatientPortal />} />
                      <Route path="/patient-portal" element={<AccountStatusGuard><PatientPortal /></AccountStatusGuard>} />
                      <Route path="/suporte/termos" element={<TermosSuporte />} />
                      <Route path="/suporte/privacidade" element={<PrivacidadeSuporte />} />
                      <Route path="/sobre" element={<Sobre />} />
                      <Route path="/empresa/recursos" element={<Recursos />} />
                      <Route path="/recursos/atendimento" element={<Atendimento />} />
                      <Route path="/recursos/prescricao" element={<Prescricao />} />
                      <Route path="/recursos/gestao" element={<Gestao />} />
                      <Route path="/empresa/blog" element={<Blog />} />
                      <Route path="/empresa/blog/:slug" element={<BlogPost />} />
                      <Route path="/empresa/sobre" element={<SobreEmpresa />} />
                      <Route path="/suporte/contato" element={<Contato />} />
                      <Route path="/suporte/ajuda" element={<CentralAjuda />} />
                      <Route path="/suporte/status" element={<Status />} />
                      <Route path="/patient-progress" element={<AccountStatusGuard><PatientProgress /></AccountStatusGuard>} />
                      <Route path="/patient-profile" element={<AccountStatusGuard><PatientProfile /></AccountStatusGuard>} />
                      <Route path="/patient-meal-plan" element={<AccountStatusGuard><PatientMealPlan /></AccountStatusGuard>} />
                      <Route path="/support" element={<AccountStatusGuard><Suporte /></AccountStatusGuard>} />
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
