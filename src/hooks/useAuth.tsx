import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as restApi from '@/services/supabase-rest';

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for existing session
    const stored = localStorage.getItem('nutriflow_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSession(parsed);
        setUser(parsed.user);
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Sanitize fullName to ASCII-only
      const sanitizedFullName = fullName
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\x00-\x7F]/g, '');

      const result = await restApi.restSignUp({
        email,
        password,
        data: { full_name: sanitizedFullName }
      });

      if (result.error) {
        return { error: new Error(result.error.message) };
      }

      if (result.session && result.user) {
        const sessionData = {
          access_token: result.session.access_token,
          user: result.user
        };
        localStorage.setItem('nutriflow_session', JSON.stringify(sessionData));
        setSession(sessionData);
        setUser(result.user);

        // Create profile
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${result.session.access_token}`,
          },
          body: JSON.stringify({
            user_id: result.user.id,
            full_name: sanitizedFullName,
          })
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await restApi.restSignIn({ email, password });

      if (result.error) {
        return { error: new Error(result.error.message) };
      }

      if (result.session && result.user) {
        const sessionData = {
          access_token: result.session.access_token,
          user: result.user
        };
        localStorage.setItem('nutriflow_session', JSON.stringify(sessionData));
        setSession(sessionData);
        setUser(result.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    try {
      if (session?.access_token) {
        await restApi.restSignOut(session.access_token);
      }
      localStorage.removeItem('nutriflow_session');
      setSession(null);
      setUser(null);
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
