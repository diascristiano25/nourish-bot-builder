import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HybridPage } from '../HybridPage';
import * as authHook from '@/hooks/useAuth';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

test('renders public content when user is null', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    user: null,
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  });

  render(
    <BrowserRouter>
      <HybridPage
        publicContent={<div>Public Version</div>}
        authContent={<div>Auth Version</div>}
        title="Test Page"
      />
    </BrowserRouter>
  );

  expect(screen.getByText('Public Version')).toBeInTheDocument();
  expect(screen.queryByText('Auth Version')).not.toBeInTheDocument();
});

test('renders auth content when user exists', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    user: { id: '123', email: 'test@example.com' },
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  });

  render(
    <BrowserRouter>
      <HybridPage
        publicContent={<div>Public Version</div>}
        authContent={<div>Auth Version</div>}
        title="Test Page"
      />
    </BrowserRouter>
  );

  expect(screen.getByText('Auth Version')).toBeInTheDocument();
  expect(screen.queryByText('Public Version')).not.toBeInTheDocument();
});
