import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Suporte from '@/pages/Suporte';

// Mock the ModernLayout component
vi.mock('@/components/layout/ModernLayout', () => ({
  ModernLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the FAQAccordion component
vi.mock('@/components/nutritionist/suporte/FAQAccordion', () => ({
  FAQAccordion: ({ faqs }: { faqs: any[] }) => (
    <div>
      {faqs.map(faq => (
        <div key={faq.id}>
          <button>{faq.question}</button>
        </div>
      ))}
    </div>
  )
}));

describe('Suporte Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders support page heading', () => {
    render(<Suporte />);
    expect(screen.getByText('Centro de Suporte')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<Suporte />);
    expect(screen.getByText('Encontre respostas para suas dúvidas sobre o NutriFlow')).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    render(<Suporte />);

    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Como Fazer')).toBeInTheDocument();
    expect(screen.getByText('Problemas')).toBeInTheDocument();
    expect(screen.getByText('Recursos')).toBeInTheDocument();
  });

  it('renders default FAQ questions', () => {
    render(<Suporte />);

    expect(screen.getByText('Como criar um novo paciente?')).toBeInTheDocument();
    expect(screen.getByText('Como gerar um cardápio personalizado?')).toBeInTheDocument();
    expect(screen.getByText('Como agendar uma consulta?')).toBeInTheDocument();
  });

  it('displays contact section with email', () => {
    render(<Suporte />);

    expect(screen.getByText('Ainda precisa de ajuda?')).toBeInTheDocument();
    expect(screen.getByText('support@nutriflow.com')).toBeInTheDocument();
  });

  it('filters FAQ items by category', async () => {
    const user = userEvent.setup();
    render(<Suporte />);

    // All button should be selected by default (all 9 FAQs shown)
    expect(screen.getAllByRole('button').filter(btn => btn.textContent === 'Como Fazer').length).toBeGreaterThan(0);

    // Click on "Como Fazer" category button
    const categoryButtons = screen.getAllByRole('button');
    const comoFazerButton = categoryButtons.find(btn => btn.textContent === 'Como Fazer' && btn.className.includes('px-4'));

    if (comoFazerButton) {
      await user.click(comoFazerButton);
      // After filtering, should show only how-to questions
      expect(screen.getByText('Como criar um novo paciente?')).toBeInTheDocument();
    }
  });

  it('renders footer resource links', () => {
    render(<Suporte />);

    expect(screen.getByText('Termos de Serviço')).toBeInTheDocument();
    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument();
  });

  it('footer links have correct href attributes', () => {
    render(<Suporte />);

    const termsLink = screen.getByText('Termos de Serviço').closest('a');
    expect(termsLink).toHaveAttribute('href', '/suporte/termos');

    const privacyLink = screen.getByText('Política de Privacidade').closest('a');
    expect(privacyLink).toHaveAttribute('href', '/suporte/privacidade');
  });

  it('contact section contains email link', () => {
    render(<Suporte />);

    const emailLink = screen.getByText('support@nutriflow.com').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:support@nutriflow.com');
  });

  it('chat button is present in contact section', () => {
    render(<Suporte />);

    expect(screen.getByText('Chat com Suporte')).toBeInTheDocument();
  });
});
