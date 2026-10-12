import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, Eye, Sparkles,
  Layout, TrendingUp, Palette, Zap
} from 'lucide-react';

export default function DesignShowcase() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Layout,
      title: 'Sidebar Fixa Verde',
      description: 'Navegação sempre visível com gradiente profissional',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Zap,
      title: 'Animações Fluidas',
      description: 'Motion control do 21st.dev para UX premium',
      gradient: 'from-[#C4764A] to-[#a8573a]'
    },
    {
      icon: TrendingUp,
      title: 'Gráficos Modernos',
      description: 'Area + Bar charts com tooltips customizados',
      gradient: 'from-[#518C5B] to-[#3d7047]'
    },
    {
      icon: Palette,
      title: 'Design System',
      description: 'Paleta emerald/teal inspirada em Medlio',
      gradient: 'from-emerald-600 to-emerald-800'
    }
  ];

  const comparisons = [
    { label: 'Sidebar Fixa', original: false, modern: true },
    { label: 'Animações Avançadas', original: false, modern: true },
    { label: 'Busca no Header', original: false, modern: true },
    { label: 'Gráficos Múltiplos', original: false, modern: true },
    { label: 'Painel Lateral Colorido', original: false, modern: true },
    { label: 'Hover Effects Elaborados', original: false, modern: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Novo Design Moderno
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            NutriFlow
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Redesenhado
            </span>
          </h1>

          <p className="text-xl text-emerald-100/80 mb-10 max-w-2xl mx-auto">
            Inspirado em Medlio (HorizonX) e Vantro, trazendo uma interface premium
            para nutricionistas modernos.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-14 px-8 text-base font-semibold gap-2"
              onClick={() => navigate('/modern-dashboard')}
            >
              Ver Demo ao Vivo
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10 rounded-xl h-14 px-8 text-base font-semibold gap-2"
              onClick={() => navigate('/dashboard-comparison')}
            >
              <Eye className="w-5 h-5" />
              Comparar Versões
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Features Principais
          </h2>
          <p className="text-emerald-100/70 text-lg">
            Tudo que você ama do original, com melhorias modernas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-emerald-100/70 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-white/10">
              <h2 className="text-3xl font-bold text-white mb-2">Comparação Rápida</h2>
              <p className="text-emerald-100/70">O que mudou do original para o moderno</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-6 text-sm font-semibold text-emerald-300">
                <div>Feature</div>
                <div className="text-center">Original</div>
                <div className="text-center">Moderno</div>
              </div>

              <div className="space-y-4">
                {comparisons.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="grid grid-cols-3 gap-4 items-center py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="text-white font-medium">{item.label}</div>
                    <div className="text-center">
                      {item.original ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/10 mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      {item.modern ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/10 mx-auto" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl border border-emerald-400/30 p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Pronto para Explorar?
            </h2>
            <p className="text-emerald-100/80 text-lg mb-8">
              Teste o novo design e compare com o original lado a lado
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl h-14 px-8 text-base font-semibold gap-2"
                onClick={() => navigate('/modern-dashboard')}
              >
                <Sparkles className="w-5 h-5" />
                Abrir Novo Dashboard
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-xl h-14 px-8 text-base font-semibold gap-2"
                onClick={() => navigate('/dashboard')}
              >
                Ver Dashboard Original
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 py-10 border-t border-white/10">
        <div className="text-center text-emerald-100/60 text-sm">
          <p>Inspirado em Medlio (HorizonX) e Vantro</p>
          <p className="mt-2">Motion Control by 21st.dev • Framer Motion</p>
        </div>
      </div>
    </div>
  );
}
