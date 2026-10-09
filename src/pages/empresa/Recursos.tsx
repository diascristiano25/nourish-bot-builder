import { Link } from "react-router-dom";
import { Calendar, Sparkles, LayoutDashboard } from "lucide-react";

export default function Recursos() {
  const recursos = [
    {
      title: "Atendimento",
      description: "Sistema de agendamento inteligente com calendário integrado, lembretes automáticos e histórico completo de consultas.",
      icon: Calendar,
      path: "/recursos/atendimento",
      color: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Prescrição",
      description: "Geração de cardápios personalizados com IA, substituições inteligentes e exportação profissional integrada à tabela TACO.",
      icon: Sparkles,
      path: "/recursos/prescricao",
      color: "bg-orange-50 dark:bg-orange-950/30"
    },
    {
      title: "Gestão",
      description: "Dashboard executivo completo com gestão de pacientes, relatórios avançados e controle financeiro integrado.",
      icon: LayoutDashboard,
      path: "/recursos/gestao",
      color: "bg-slate-50 dark:bg-slate-950/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Recursos do NutriFlow
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Descubra todas as ferramentas que vão transformar a gestão do seu consultório de nutrição
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {recursos.map((recurso) => {
            const Icon = recurso.icon;
            return (
              <Link
                key={recurso.path}
                to={recurso.path}
                className="group block"
              >
                <div className="h-full p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`w-16 h-16 rounded-xl ${recurso.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {recurso.title}
                  </h2>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {recurso.description}
                  </p>

                  <div className="mt-6 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="group-hover:translate-x-1 transition-transform">Saiba mais</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-emerald-950/30 dark:to-orange-950/30 border-2 border-slate-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            Pronto para começar?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Experimente gratuitamente todas as funcionalidades do NutriFlow
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            Criar conta gratuita
          </Link>
        </div>
      </div>
    </div>
  );
}
