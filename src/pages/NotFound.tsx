import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-nutriflow.png";

const WHATSAPP_URL =
  "https://wa.me/5513996205253?text=" +
  encodeURIComponent("Olá! Cheguei a uma página que não existe no NutriFlow e preciso de ajuda.");

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img src={logoImg} alt="NutriFlow" className="h-9 w-auto" />
          <span className="font-serif text-xl font-bold text-foreground">NutriFlow</span>
        </Link>

        <p className="text-6xl font-bold text-[#518C5B] mb-3">404</p>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          O link que você acessou não existe ou foi movido. Vamos te ajudar a voltar ao caminho certo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2 bg-[#518C5B] hover:bg-[#3d7047] text-white">
            <Link to="/">
              <Home className="w-4 h-4" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 border-border/60">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          </Button>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar à página anterior
        </button>
      </div>
    </div>
  );
};

export default NotFound;