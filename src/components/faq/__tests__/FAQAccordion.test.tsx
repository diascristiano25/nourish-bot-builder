import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAQAccordion } from '../FAQAccordion';
import { FAQCategory } from '@/types/faq';

describe('FAQAccordion', () => {
  const mockCategories: FAQCategory[] = [
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: 'Rocket',
      questions: [
        {
          id: 'q1',
          q: 'Como criar minha conta?',
          a: 'Para criar sua conta, clique em Começar Grátis.',
        },
        {
          id: 'q2',
          q: 'Como fazer login?',
          a: 'Use seu email e senha cadastrados.',
        },
      ],
    },
    {
      id: 'billing',
      title: 'Pagamento',
      icon: 'CreditCard',
      questions: [
        {
          id: 'q3',
          q: 'Quais formas de pagamento aceitas?',
          a: 'Aceitamos cartão de crédito e PIX.',
        },
      ],
    },
  ];

  it('renders all categories', () => {
    render(<FAQAccordion categories={mockCategories} />);
    expect(screen.getByText('Primeiros Passos')).toBeInTheDocument();
    expect(screen.getByText('Pagamento')).toBeInTheDocument();
  });

  it('renders search bar', () => {
    render(<FAQAccordion categories={mockCategories} />);
    const searchInput = screen.getByPlaceholderText('Buscar pergunta...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters questions by search query', () => {
    render(<FAQAccordion categories={mockCategories} />);
    const searchInput = screen.getByPlaceholderText('Buscar pergunta...');

    fireEvent.change(searchInput, { target: { value: 'login' } });

    expect(screen.getByText('Como fazer login?')).toBeInTheDocument();
    expect(screen.queryByText('Como criar minha conta?')).not.toBeInTheDocument();
  });

  it('filters questions by answer content', () => {
    render(<FAQAccordion categories={mockCategories} />);
    const searchInput = screen.getByPlaceholderText('Buscar pergunta...');

    fireEvent.change(searchInput, { target: { value: 'PIX' } });

    expect(screen.getByText('Quais formas de pagamento aceitas?')).toBeInTheDocument();
    expect(screen.queryByText('Como criar minha conta?')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    render(<FAQAccordion categories={mockCategories} />);
    const searchInput = screen.getByPlaceholderText('Buscar pergunta...');

    fireEvent.change(searchInput, { target: { value: 'xyz123notfound' } });

    expect(screen.getByText(/Nenhuma pergunta encontrada/)).toBeInTheDocument();
  });

  it('renders all questions when search is empty', () => {
    render(<FAQAccordion categories={mockCategories} />);
    expect(screen.getByText('Como criar minha conta?')).toBeInTheDocument();
    expect(screen.getByText('Como fazer login?')).toBeInTheDocument();
    expect(screen.getByText('Quais formas de pagamento aceitas?')).toBeInTheDocument();
  });

  it('search is case-insensitive', () => {
    render(<FAQAccordion categories={mockCategories} />);
    const searchInput = screen.getByPlaceholderText('Buscar pergunta...');

    fireEvent.change(searchInput, { target: { value: 'LOGIN' } });

    expect(screen.getByText('Como fazer login?')).toBeInTheDocument();
  });
});
