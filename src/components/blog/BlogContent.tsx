import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export interface BlogContentProps {
  content: string;
  isPremium: boolean;
  isAuthenticated: boolean;
}

export function BlogContent({ content, isPremium, isAuthenticated }: BlogContentProps) {
  const shouldShowPaywall = isPremium && !isAuthenticated;

  if (!shouldShowPaywall) {
    return (
      <div
        className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-[#518C5B]"
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(content) }}
      />
    );
  }

  // Show first 2 paragraphs for premium content when not authenticated
  const paragraphs = content.split('\n\n');
  const previewParagraphs = paragraphs.slice(0, 2).join('\n\n');

  return (
    <div className="relative">
      <div
        className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-[#518C5B]"
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(previewParagraphs) }}
      />

      <div className="relative mt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background h-64 -mt-32" />

        <Card className="relative border-2 border-[#C4764A] p-8 text-center space-y-4 bg-[#FAF8F5]">
          <div className="flex justify-center">
            <div className="rounded-full bg-[#C4764A]/10 p-4">
              <Lock className="h-8 w-8 text-[#C4764A]" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-foreground">
            Continue lendo
          </h3>

          <p className="text-muted-foreground max-w-md mx-auto">
            Este é um conteúdo premium. Cadastre-se gratuitamente para acessar artigos exclusivos e recursos profissionais.
          </p>

          <div className="flex gap-3 justify-center pt-2">
            <Button asChild size="lg" className="bg-[#518C5B] hover:bg-[#518C5B]/90">
              <Link to="/cadastro">
                Cadastre-se Grátis
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/login">
                Fazer Login
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Simple markdown to HTML converter for basic formatting
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) {
      return para;
    }
    return `<p>${para}</p>`;
  }).join('\n');

  return html;
}
