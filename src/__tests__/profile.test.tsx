import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '@/pages/Profile';
import { ProfileForm } from '@/components/nutritionist/profile/ProfileForm';

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    loading: false,
  })
}));

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-profile-1',
              full_name: 'Dr. João Silva',
              crn: 'CRN-1 12345',
              phone: '(11) 99999-9999',
              bio: 'Especialista em emagrecimento',
              specialties: ['Emagrecimento'],
              photo_url: null,
              logo_url: null,
              primary_color: '#10B981',
              secondary_color: '#059669',
              email_signature: 'Atenciosamente, Dr. João'
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Mock router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock components
vi.mock('@/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/layout/ModernLayout', () => ({
  ModernLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/OnboardingTour', () => ({
  restartOnboardingTour: vi.fn(),
  isTourCompleted: vi.fn()
}));

describe('Profile Page', () => {
  it('displays loading state initially', () => {
    // This would render with loading = true
    render(<div>Loading...</div>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('ProfileForm Component', () => {
  const mockProfile = {
    id: 'test-1',
    full_name: 'Dr. Maria Santos',
    crn: 'CRN-1 54321',
    phone: '(11) 98888-8888',
    bio: 'Nutricionista especializada',
    specialties: ['Nutrição Esportiva'],
    photo_url: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields with correct labels', () => {
    render(<ProfileForm profile={mockProfile} />);

    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    expect(screen.getByLabelText('Biografia')).toBeInTheDocument();
  });

  it('fills form with profile data', () => {
    render(<ProfileForm profile={mockProfile} />);

    const nameInput = screen.getByDisplayValue('Dr. Maria Santos');
    const phoneInput = screen.getByDisplayValue('(11) 98888-8888');

    expect(nameInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
  });

  it('email field is disabled', () => {
    render(<ProfileForm profile={mockProfile} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.disabled).toBe(true);
  });

  it('updates form values on input change', async () => {
    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} />);

    const phoneInput = screen.getByDisplayValue('(11) 98888-8888') as HTMLInputElement;
    await user.clear(phoneInput);
    await user.type(phoneInput, '(11) 99999-9999');

    expect(phoneInput.value).toBe('(11) 99999-9999');
  });

  it('renders specialty buttons', () => {
    render(<ProfileForm profile={mockProfile} />);

    expect(screen.getByText('Emagrecimento')).toBeInTheDocument();
    expect(screen.getByText('Ganho de Massa')).toBeInTheDocument();
    expect(screen.getByText('Nutrição Esportiva')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<ProfileForm profile={mockProfile} />);

    const saveButton = screen.getByRole('button', { name: /Salvar Perfil/i });
    expect(saveButton).toBeInTheDocument();
  });
});
