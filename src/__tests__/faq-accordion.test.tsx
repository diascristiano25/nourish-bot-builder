import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQAccordion, FAQ } from '@/components/nutritionist/suporte/FAQAccordion';

describe('FAQAccordion Component', () => {
  const mockFaqs: FAQ[] = [
    {
      id: '1',
      question: 'Como criar um novo paciente?',
      answer: 'Vá para a seção de Pacientes e clique em "Novo Paciente"...',
      category: 'how-to'
    },
    {
      id: '2',
      question: 'Como gerar um cardápio?',
      answer: 'Acesse o perfil do paciente e clique em "Gerar Novo Cardápio"...',
      category: 'how-to'
    },
    {
      id: '3',
      question: 'Por que meu cardápio não foi gerado?',
      answer: 'Verifique se todas as informações obrigatórias foram preenchidas...',
      category: 'troubleshooting'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all FAQ items', () => {
    render(<FAQAccordion faqs={mockFaqs} />);

    expect(screen.getByText('Como criar um novo paciente?')).toBeInTheDocument();
    expect(screen.getByText('Como gerar um cardápio?')).toBeInTheDocument();
    expect(screen.getByText('Por que meu cardápio não foi gerado?')).toBeInTheDocument();
  });

  it('displays questions but not answers initially', () => {
    render(<FAQAccordion faqs={mockFaqs} />);

    expect(screen.getByText('Como criar um novo paciente?')).toBeInTheDocument();
    expect(screen.queryByText('Vá para a seção de Pacientes')).not.toBeInTheDocument();
  });

  it('expands accordion item when clicked', async () => {
    const user = userEvent.setup();
    render(<FAQAccordion faqs={mockFaqs} />);

    const firstQuestion = screen.getByText('Como criar um novo paciente?');
    await user.click(firstQuestion);

    expect(screen.getByText('Vá para a seção de Pacientes e clique em "Novo Paciente"...')).toBeInTheDocument();
  });

  it('collapses accordion item when clicked again', async () => {
    const user = userEvent.setup();
    render(<FAQAccordion faqs={mockFaqs} />);

    const firstQuestion = screen.getByText('Como criar um novo paciente?');

    // First click to expand
    await user.click(firstQuestion);
    expect(screen.getByText('Vá para a seção de Pacientes e clique em "Novo Paciente"...')).toBeInTheDocument();

    // Second click to collapse
    await user.click(firstQuestion);
    expect(screen.queryByText('Vá para a seção de Pacientes e clique em "Novo Paciente"...')).not.toBeInTheDocument();
  });

  it('closes previous item when opening a new one', async () => {
    const user = userEvent.setup();
    render(<FAQAccordion faqs={mockFaqs} />);

    const firstQuestion = screen.getByText('Como criar um novo paciente?');
    const secondQuestion = screen.getByText('Como gerar um cardápio?');

    // Open first item
    await user.click(firstQuestion);
    expect(screen.getByText('Vá para a seção de Pacientes e clique em "Novo Paciente"...')).toBeInTheDocument();

    // Open second item
    await user.click(secondQuestion);
    expect(screen.getByText('Acesse o perfil do paciente e clique em "Gerar Novo Cardápio"...')).toBeInTheDocument();

    // First item should be closed
    expect(screen.queryByText('Vá para a seção de Pacientes e clique em "Novo Paciente"...')).not.toBeInTheDocument();
  });

  it('renders with empty list gracefully', () => {
    const { container } = render(<FAQAccordion faqs={[]} />);
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('handles items with special characters in text', () => {
    const specialFaqs: FAQ[] = [
      {
        id: '1',
        question: 'Como usar & símbolos especiais? "Aspas"',
        answer: 'Resposta com <html> e caracteres especiais: @#$%',
        category: 'how-to'
      }
    ];

    render(<FAQAccordion faqs={specialFaqs} />);

    expect(screen.getByText(/Como usar & símbolos especiais\?/)).toBeInTheDocument();
  });
});
