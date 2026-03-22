import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/lib/query-keys';

const API_BASE = 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Session {
  user: User | null;
}

async function fetchSession(): Promise<Session> {
  const res = await fetch(`${API_BASE}/api/auth/get-session`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json();
}

async function signOut(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });
}

async function signIn(email: string, password: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Sign in failed');
  }
  return res.json();
}

async function signUp(email: string, password: string, name: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Sign up failed');
  }
  return res.json();
}

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: fetchSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      signUp(email, password, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
