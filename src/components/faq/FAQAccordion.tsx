import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { FAQCategory } from '@/types/faq';

interface FAQAccordionProps {
  categories: FAQCategory[];
}

export function FAQAccordion({ categories }: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter questions based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(query) ||
            q.a.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar pergunta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma pergunta encontrada para "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const IconComponent =
              (LucideIcons as any)[category.icon] || LucideIcons.HelpCircle;

            return (
              <div key={category.id} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#518C5B]/10">
                    <IconComponent className="h-6 w-6 text-[#518C5B]" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {category.title}
                  </h2>
                </div>

                {/* Questions Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((question, idx) => (
                    <AccordionItem
                      key={question.id || `${category.id}-q${idx}`}
                      value={question.id || `${category.id}-q${idx}`}
                    >
                      <AccordionTrigger className="text-left">
                        {question.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {question.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
