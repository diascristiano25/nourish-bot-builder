import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Financeiro from './Financeiro';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@test.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: 'nutritionist-1' },
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'nutritionist-1' },
            error: null,
          }),
        }),
      };
    }
    if (table === 'financial_records') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: '1',
                record_type: 'Receita',
                amount: 1000,
                description: 'Consulta - João Silva',
                record_date: '2024-01-15',
                status: 'completed',
                created_at: '2024-01-15T10:00:00Z',
              },
            ],
            error: null,
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
    }
    return {};
  });

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

const renderFinanceiro = () => {
  return render(
    <BrowserRouter>
      <Financeiro />
    </BrowserRouter>
  );
};

describe('Financeiro Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders financeiro page with heading', async () => {
    renderFinanceiro();

    await waitFor(() => {
      expect(screen.getByText('Financeiro')).toBeInTheDocument();
    });
  });

  it('displays revenue chart', async () => {
    renderFinanceiro();

    await waitFor(() => {
      expect(screen.getByText(/Faturamento dos Últimos 6 Meses/i)).toBeInTheDocument();
    });
  });

  it('displays transaction list', async () => {
    renderFinanceiro();

    await waitFor(() => {
      expect(screen.getByText(/Lançamentos Recentes/i)).toBeInTheDocument();
    });
  });

  it('displays financial summary cards', async () => {
    renderFinanceiro();

    await waitFor(() => {
      expect(screen.getByText(/Entradas do Mês/i)).toBeInTheDocument();
      expect(screen.getByText(/Pendentes/i)).toBeInTheDocument();
      expect(screen.getByText(/Total do Mês/i)).toBeInTheDocument();
    });
  });

  it('has new transaction button', async () => {
    renderFinanceiro();

    await waitFor(() => {
      const button = screen.queryByText(/Novo Lançamento/i);
      expect(button).toBeTruthy();
    });
  });

  it('renders without crashing', () => {
    renderFinanceiro();
    expect(document.body).toBeInTheDocument();
  });

  it('displays transaction data in list', async () => {
    renderFinanceiro();

    await waitFor(() => {
      // Should have at least the table header
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
