import * as LucideIcons from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQCategory as FAQCategoryType } from '@/types/faq';

interface FAQCategoryProps {
  category: FAQCategoryType;
}

export function FAQCategory({ category }: FAQCategoryProps) {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.HelpCircle;

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#518C5B]/10">
          <IconComponent className="h-6 w-6 text-[#518C5B]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
      </div>

      {/* Questions Accordion */}
      <Accordion type="single" collapsible className="w-full">
        {category.questions.map((question) => (
          <AccordionItem key={question.id} value={question.id}>
            <AccordionTrigger className="text-left">
              {question.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {question.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
