import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const WHATSAPP_NUMBER = '5547992381906';
const WHATSAPP_MESSAGE = 'Olá! Preciso de ajuda com o NutriFlow.';

export function FloatingSupportButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-6 h-6" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-background border-border">
          <p>Precisa de ajuda?</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
