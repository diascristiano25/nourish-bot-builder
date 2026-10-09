import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketForm } from '@/components/support/TicketForm';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('TicketForm', () => {
  const mockUser = { id: '123', email: 'test@example.com' };
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits ticket and calls onSuccess', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null });
    const mockSelectSingle = vi.fn().mockResolvedValue({ data: { id: 'nutritionist-123' }, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'nutritionists') {
        return {
          select: mockSelect,
        } as any;
      }
      return {
        insert: mockInsert,
      } as any;
    });

    render(<TicketForm user={mockUser} onSuccess={mockOnSuccess} />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Test message' } });

    // Select component - find the native select in the DOM
    const selectElement = document.querySelector('select[name="subject"]') as HTMLSelectElement;
    if (selectElement) {
      fireEvent.change(selectElement, { target: { value: 'Dúvida Técnica' } });
    }

    fireEvent.click(screen.getByText('Enviar Mensagem'));

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  it('renders all form fields for authenticated user', () => {
    render(<TicketForm user={mockUser} onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Assunto')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument();
  });

  it('pre-fills email for authenticated user', () => {
    render(<TicketForm user={mockUser} onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');
  });

  it('renders form for anonymous user', () => {
    render(<TicketForm user={null} onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
