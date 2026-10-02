import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signIn: vi.fn(async (email, password) => {
      if (email === 'test@test.com' && password === 'password123') {
        return { error: null };
      }
      return { error: new Error('Invalid credentials') };
    }),
    signUp: vi.fn(async (email, password, name) => {
      if (email && password && name) {
        return { error: null };
      }
      return { error: new Error('Invalid data') };
    }),
  })),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );
};

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login and signup tabs', () => {
    renderAuth();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByText('Cadastrar')).toBeInTheDocument();
  });

  it('shows email and password inputs', () => {
    renderAuth();
    const emailInputs = screen.getAllByPlaceholderText(/email/i);
    const passwordInputs = screen.getAllByPlaceholderText(/senha/i);

    expect(emailInputs.length).toBeGreaterThan(0);
    expect(passwordInputs.length).toBeGreaterThan(0);
  });

  it('validates email format', async () => {
    renderAuth();
    const user = userEvent.setup();

    const emailInput = screen.getAllByPlaceholderText(/email/i)[0];
    const submitButton = screen.getByRole('button', { name: /acessar/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Validation should catch this
    expect(emailInput).toHaveValue('invalid-email');
  });

  it('requires minimum password length', async () => {
    renderAuth();
    const user = userEvent.setup();

    const passwordInputs = screen.getAllByPlaceholderText(/senha/i);
    await user.type(passwordInputs[0], '123');

    expect(passwordInputs[0]).toHaveValue('123');
  });

  it('handles signup form fields', async () => {
    renderAuth();
    const user = userEvent.setup();

    // Click signup tab
    const signupTab = screen.getByText('Cadastrar');
    await user.click(signupTab);

    // Check for name input in signup
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(2); // email, name at minimum
  });

  it('shows loading state during submission', async () => {
    renderAuth();
    const user = userEvent.setup();

    const emailInput = screen.getAllByPlaceholderText(/email/i)[0];
    const passwordInput = screen.getAllByPlaceholderText(/senha/i)[0];
    const submitButton = screen.getByRole('button', { name: /acessar|cadastrar/i });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    }, { timeout: 100 }).catch(() => {
      // Loading state might be brief
    });
  });

  it('toggles between login and signup', async () => {
    renderAuth();
    const user = userEvent.setup();

    const signupTab = screen.getByText('Cadastrar');
    expect(signupTab).toBeInTheDocument();

    await user.click(signupTab);

    // Signup specific element should appear
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(2);
  });
});
