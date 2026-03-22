import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { useSignIn, useSignUp } from '~/hooks/use-session';

export function AuthView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const signIn = useSignIn();
  const signUp = useSignUp();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isRegistering) {
        await signUp.mutateAsync({ email, password, name });
      } else {
        await signIn.mutateAsync({ email, password });
      }
    } catch {
      // Error is handled by the mutation
    }
  }

  const error = signIn.error?.message || signUp.error?.message;
  const loading = signIn.isPending || signUp.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[320px]">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-[1.5rem] font-semibold tracking-tight mb-2">NanoDB</h1>
          <p className="text-sm text-muted-foreground">AI-Native NoCode Database</p>
        </div>

        <h2 className="text-base font-semibold mb-6">
          {isRegistering ? 'Create account' : 'Sign in'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegistering && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Please wait...
              </span>
            ) : isRegistering ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setName('');
          }}
          className="w-full mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRegistering
            ? 'Already have an account? Sign in'
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
