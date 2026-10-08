import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { heroContent } from '@/data/landingContent';
import { useState } from 'react';

export function HeroWithScreenshot(): JSX.Element {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({ name: '', email: '' });

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { name: '', email: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Nome obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    if (!newErrors.name && !newErrors.email) {
      // Redirect to auth page with signup mode
      window.location.href = '/auth?mode=signup&email=' + encodeURIComponent(formData.email) + '&name=' + encodeURIComponent(formData.name);
    }
  };

  return (
    <section className="py-20 px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content & Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                {heroContent.headline}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                {heroContent.subheadline}
              </p>
            </div>

            {/* Inline Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                  aria-label="Nome completo"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-600 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Seu email profissional"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                  aria-label="Email profissional"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Testar Grátis 14 Dias
              </Button>
            </form>

            {/* Trust Badges Strip */}
            <div className="flex flex-wrap gap-3 items-center pt-4">
              <span className="text-sm text-slate-500">Integrado com:</span>
              <Badge variant="outline" className="px-3 py-1 text-slate-700 border-slate-300">
                Google Calendar
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-slate-700 border-slate-300">
                WhatsApp
              </Badge>
            </div>
          </div>

          {/* Right: Screenshot */}
          <div className="order-first lg:order-last">
            <img
              src={heroContent.screenshotUrl}
              alt="Painel do NutriFlow mostrando dashboard de nutrição"
              className="rounded-lg border border-slate-200 shadow-2xl w-full"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
