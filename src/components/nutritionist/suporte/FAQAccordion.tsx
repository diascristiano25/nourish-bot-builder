import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { slideInLeft } from '@/lib/motion-variants';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {faqs.map((faq, index) => (
        <motion.div
          key={faq.id}
          variants={itemVariants}
          className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors"
        >
          <button
            onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-foreground">{faq.question}</span>
            <motion.div
              animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 ml-4"
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedId === faq.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <p className="text-foreground/80 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}
