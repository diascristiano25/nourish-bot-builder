import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layout, Sparkles, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardComparison() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'both' | 'old' | 'new'>('both');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Comparação de Interfaces</h1>
                <p className="text-sm text-muted-foreground">Dashboard Original vs Novo Design</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <Button
                variant={activeView === 'both' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('both')}
                className="gap-2"
              >
                <Layout className="w-4 h-4" />
                Ambos
              </Button>
              <Button
                variant={activeView === 'old' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('old')}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Original
              </Button>
              <Button
                variant={activeView === 'new' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('new')}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Novo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'both' && (
            <motion.div
              key="both"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Original Dashboard */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">Dashboard Original</h2>
                      <p className="text-xs text-slate-500">Design atual do NutriFlow</p>
                    </div>
                  </div>
                  <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      src="/dashboard"
                      className="w-full h-full"
                      title="Original Dashboard"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate('/dashboard')}
                  >
                    Abrir em Tela Cheia
                  </Button>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold mb-3 text-sm">Características</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Paleta orgânica (Sage Green + Terracotta)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Layout com AppLayout existente
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Cards arredondados orgânicos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Gráficos em area chart
                    </li>
                  </ul>
                </div>
              </div>

              {/* New Modern Dashboard */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-emerald-900">Novo Design Moderno</h2>
                      <p className="text-xs text-emerald-600">Inspirado em Medlio + HorizonX</p>
                    </div>
                  </div>
                  <div className="aspect-video bg-white rounded-xl overflow-hidden border border-emerald-200 shadow-xl shadow-emerald-500/20">
                    <iframe
                      src="/modern-dashboard"
                      className="w-full h-full"
                      title="Modern Dashboard"
                    />
                  </div>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    onClick={() => navigate('/modern-dashboard')}
                  >
                    Abrir em Tela Cheia
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold mb-3 text-sm text-emerald-900">Novidades</h3>
                  <ul className="space-y-2 text-sm text-emerald-700">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Sidebar verde fixa com gradiente
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Cards com hover effects modernos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Animações com Framer Motion
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Gráficos combinados (Area + Bar)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Header com busca integrada
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Painel lateral colorido para agenda
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'old' && (
            <motion.div
              key="old"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto"
            >
              <div className="aspect-video bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl">
                <iframe
                  src="/dashboard"
                  className="w-full h-full"
                  title="Original Dashboard Full"
                />
              </div>
            </motion.div>
          )}

          {activeView === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto"
            >
              <div className="aspect-video bg-white rounded-3xl overflow-hidden border-2 border-emerald-200 shadow-2xl shadow-emerald-500/20">
                <iframe
                  src="/modern-dashboard"
                  className="w-full h-full"
                  title="Modern Dashboard Full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl p-8 border border-slate-200"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Comparação de Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">Original</th>
                  <th className="text-center py-4 px-4 font-semibold text-emerald-700">Novo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { feature: 'Sidebar Fixa', original: '❌', new: '✅' },
                  { feature: 'Animações Fluidas', original: '✅ Básicas', new: '✅ Avançadas' },
                  { feature: 'Busca no Header', original: '❌', new: '✅' },
                  { feature: 'Modo Zen', original: '✅', new: '🚧 Em breve' },
                  { feature: 'Gráficos', original: '✅ Area Chart', new: '✅ Area + Bar' },
                  { feature: 'Dashboard Customizável', original: '✅', new: '🚧 Em breve' },
                  { feature: 'Painel Lateral Colorido', original: '❌', new: '✅' },
                  { feature: 'Hover Effects', original: '✅ Simples', new: '✅ Elaborados' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-slate-700">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-sm">{row.original}</td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-emerald-600">{row.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
