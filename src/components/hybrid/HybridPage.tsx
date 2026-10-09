import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PublicLayout } from './PublicLayout';

export interface HybridPageProps {
  publicContent: ReactNode;
  authContent: ReactNode;
  title: string;
  description?: string;
}

export function HybridPage({ publicContent, authContent, title, description }: HybridPageProps) {
  const { user } = useAuth();

  useEffect(() => {
    document.title = `${title} | NutriFlow`;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  if (user === null) {
    return <PublicLayout>{publicContent}</PublicLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      {authContent}
    </div>
  );
}
