import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FAQ } from '../FAQ';

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
            question: 'Como criar minha conta?',
            answer: 'Para criar sua conta...',
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
            question: 'Como criar minha conta?',
            answer: 'Para criar sua conta...',
          },
        ],
      },
    ],
  },
}));

describe('FAQ', () => {
  it('renders page title', () => {
    render(<FAQ />);
    expect(screen.getByText('Perguntas Frequentes')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<FAQ />);
    expect(
      screen.getByText('Encontre respostas para as dúvidas mais comuns sobre o NutriFlow')
    ).toBeInTheDocument();
  });

  it('renders FAQ categories', () => {
    render(<FAQ />);
    expect(screen.getByText('Primeiros Passos')).toBeInTheDocument();
  });

  it('renders contact CTA', () => {
    render(<FAQ />);
    expect(screen.getByText('Não encontrou o que procurava?')).toBeInTheDocument();
    expect(screen.getByText('Falar com Suporte')).toBeInTheDocument();
  });

  it('contact CTA links to correct page', () => {
    render(<FAQ />);
    const link = screen.getByText('Falar com Suporte').closest('a');
    expect(link).toHaveAttribute('href', '/empresa/contato');
  });

  it('renders questions from data', () => {
    render(<FAQ />);
    expect(screen.getByText('Como criar minha conta?')).toBeInTheDocument();
  });
});
