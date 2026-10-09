import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CentralAjuda } from '../CentralAjuda';

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

// Mock the HybridPage component to simplify testing
vi.mock('@/components/hybrid/HybridPage', () => ({
  HybridPage: ({ publicContent }: any) => <div>{publicContent}</div>,
}));

// Mock FAQ data
vi.mock('@/content/faq/public.json', () => ({
  default: {
    categories: [
      {
        id: 'getting-started',
        title: 'Primeiros Passos',
        icon: 'Rocket',
        questions: [
          {
            id: 'q1',
            q: 'Como criar minha conta?',
            a: 'Para criar sua conta...',
          },
        ],
      },
    ],
  },
}));

vi.mock('@/content/faq/auth.json', () => ({
  default: {
    categories: [
      {
        id: 'getting-started',
        title: 'Primeiros Passos',
        icon: 'Rocket',
        questions: [
          {
            id: 'q1',
            q: 'Como criar minha conta?',
            a: 'Para criar sua conta...',
          },
        ],
      },
    ],
  },
}));

describe('CentralAjuda', () => {
  it('renders page title', () => {
    render(<CentralAjuda />);
    expect(screen.getByText('Central de Ajuda')).toBeInTheDocument();
  });

  it('renders page description for public users', () => {
    render(<CentralAjuda />);
    expect(
      screen.getByText('Encontre respostas para as dúvidas mais comuns sobre o NutriFlow')
    ).toBeInTheDocument();
  });

  it('renders FAQ categories', () => {
    render(<CentralAjuda />);
    expect(screen.getByText('Primeiros Passos')).toBeInTheDocument();
  });

  it('renders search bar', () => {
    render(<CentralAjuda />);
    expect(screen.getByPlaceholderText('Buscar pergunta...')).toBeInTheDocument();
  });

  it('renders public CTA with correct text', () => {
    render(<CentralAjuda />);
    expect(screen.getByText('Precisa de mais ajuda?')).toBeInTheDocument();
    const ctaButton = screen.getByRole('link', { name: 'Cadastre-se' });
    expect(ctaButton).toBeInTheDocument();
  });

  it('CTA button links to auth page', () => {
    render(<CentralAjuda />);
    const link = screen.getByRole('link', { name: 'Cadastre-se' });
    expect(link).toHaveAttribute('href', '/auth');
  });

  it('renders questions from data', () => {
    render(<CentralAjuda />);
    expect(screen.getByText('Como criar minha conta?')).toBeInTheDocument();
  });
});
