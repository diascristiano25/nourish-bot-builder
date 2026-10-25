import { Play, Volume2 } from 'lucide-react';
import { useState, useRef } from 'react';

export default function VideoShowcaseSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative bg-nf-bg-alt py-24 md:py-36 overflow-hidden">
      {/* Transition divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />

      {/* Background decoration */}
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-nf-teal/3 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-nf-coral/3 rounded-full blur-3xl animate-float pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 scroll-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-semibold uppercase tracking-wider mb-4 border border-nf-teal/20">
            Demonstração
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-nf-text mb-6">
            Veja o NutriFlow{' '}
            <span className="gradient-text">em ação</span>
          </h2>
          <p className="text-lg text-nf-text-muted max-w-2xl mx-auto leading-relaxed">
            Descubra como nossa plataforma transforma a gestão nutricional em segundos.
          </p>
        </div>

        {/* Video container */}
        <div className="relative max-w-5xl mx-auto scroll-scale-in">
          {/* Glow effect behind video */}
          <div className="absolute -inset-4 bg-gradient-to-r from-nf-teal/20 via-nf-coral/20 to-nf-teal/20 rounded-3xl blur-2xl opacity-50 animate-gradient-shift" />

          {/* Video wrapper with glass effect */}
          <div className="relative glass-card rounded-3xl overflow-hidden shadow-2xl group">
            {/* Video element */}
            <div className="relative aspect-video bg-nf-text/5">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="/videos/nutriflow-demo-poster.jpg"
                onEnded={() => setIsPlaying(false)}
                playsInline
              >
                <source src="/videos/nutriflow-demo.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos HTML5.
              </video>

              {/* Play button overlay */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-nf-text/20 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-nf-text/30"
                  onClick={handlePlay}
                >
                  <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-full bg-nf-teal/30 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-0 rounded-full bg-nf-teal/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />

                    {/* Play button */}
                    <button className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-nf-teal hover:bg-nf-teal/90 text-white flex items-center justify-center shadow-2xl shadow-nf-teal/50 transition-all duration-300 hover:scale-110 group-hover:shadow-nf-teal/70">
                      <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div>
              )}

              {/* Controls overlay when playing */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-nf-text/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePlay}
                      className="flex items-center gap-2 text-white hover:text-nf-teal transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/30 transition-colors">
                        {isPlaying ? (
                          <div className="flex gap-1">
                            <div className="w-1 h-4 bg-card rounded" />
                            <div className="w-1 h-4 bg-card rounded" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                    </button>

                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Volume2 className="w-4 h-4" />
                      <span>Demo NutriFlow</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video info bar */}
            <div className="p-6 md:p-8 bg-nf-bg border-t border-nf-border/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-nf-text mb-2">
                    Demonstração Completa da Plataforma
                  </h3>
                  <p className="text-nf-text-muted text-sm md:text-base">
                    Veja como gerar cardápios, gerenciar pacientes e acompanhar resultados em tempo real.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-full bg-nf-teal/10 text-nf-teal text-sm font-semibold border border-nf-teal/20">
                    30 segundos
                  </div>
                  <div className="px-4 py-2 rounded-full bg-nf-coral/10 text-nf-coral text-sm font-semibold border border-nf-coral/20">
                    HD 1080p
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements around video */}
          <div className="absolute -top-6 -left-6 md:-left-12 glass-card rounded-2xl p-4 animate-float shadow-xl max-w-[200px] hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-nf-text">Ao vivo</span>
            </div>
            <div className="text-xs text-nf-text-muted">
              Demonstração real da plataforma
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 md:-right-12 glass-card rounded-2xl p-4 animate-float-delay shadow-xl hidden md:block">
            <div className="text-2xl font-bold gradient-text mb-1">100%</div>
            <div className="text-xs text-nf-text-muted">Funcionalidades reais</div>
          </div>
        </div>

        {/* Features below video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { title: 'Interface Intuitiva', desc: 'Navegação simples e direta' },
            { title: 'Resultados Reais', desc: 'Dados de produção, não mockups' },
            { title: 'Fluxo Completo', desc: 'Do cadastro ao relatório final' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center scroll-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
              <h4 className="font-serif text-lg font-bold text-nf-text mb-2">{item.title}</h4>
              <p className="text-sm text-nf-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transition divider to next section */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
    </section>
  );
}