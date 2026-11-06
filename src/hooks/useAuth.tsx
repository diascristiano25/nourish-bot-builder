import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface SignUpOptions {
  phone?: string;
  crn?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, options?: SignUpOptions) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
      if (supabaseSession) {
        const sessionData = {
          access_token: supabaseSession.access_token,
          user: {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || '',
          },
        };
        setSession(sessionData);
        setUser(sessionData.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (supabaseSession) {
        const sessionData = {
          access_token: supabaseSession.access_token,
          user: {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || '',
          },
        };
        setSession(sessionData);
        setUser(sessionData.user);
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, options?: SignUpOptions) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: options?.phone || null,
            crn: options?.crn || null,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.session && data.user) {
        const sessionData = {
          access_token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
        };
        setSession(sessionData);
        setUser(sessionData.user);

        // Fire-and-forget welcome email
        supabase.functions.invoke('send-welcome-email', {
          body: { email, name: fullName, user_id: data.user.id },
        }).catch((err) => console.error('Welcome email failed:', err));
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.session && data.user) {
        const sessionData = {
          access_token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
        };
        setSession(sessionData);
        setUser(sessionData.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] Initiating Google OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        console.error('[Auth] Google OAuth error:', error);
        return { error: new Error(error.message) };
      }

      console.log('[Auth] Google OAuth initiated successfully, redirecting...', data);
      return { error: null };
    } catch (error) {
      console.error('[Auth] Google OAuth exception:', error);
      return { error: error instanceof Error ? error : new Error('Google sign in failed') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

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
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
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
