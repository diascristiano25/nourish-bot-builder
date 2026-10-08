import { Card, CardContent } from '@/components/ui/card';
import { testimonials } from '@/data/landingContent';

export function TestimonialGrid() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900">
          O que dizem nossos clientes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => {
            // Strip @ if present in data before URL construction
            const instagramHandle = testimonial.instagram.replace('@', '');
            const instagramUrl = `https://instagram.com/${instagramHandle}`;

            return (
              <Card key={testimonial.id} className="border-slate-200">
                <CardContent className="p-6">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="rounded-full w-16 h-16 mb-4 object-cover"
                    loading="lazy"
                  />

                  <p className="text-slate-700 italic mb-4">
                    "{testimonial.quote}"
                  </p>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {testimonial.city}, {testimonial.state}
                    </p>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline inline-block"
                    >
                      @{instagramHandle}
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
