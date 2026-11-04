import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <AuthForm
      title="Welcome back"
      description="Please login to continue."
      onSubmit={handleSubmit}
      footerText="Don't have an account?"
      footerLink="/register"
      footerLinkText="Register"
      error={error}
      backArrow={
        <Link to="/" className="inline-block mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[var(--color-dark)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      }
    >
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 mt-1 rounded bg-[var(--color-background)] text-[var(--color-dark)] shadow-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 mt-1 rounded bg-[var(--color-background)] text-[var(--color-dark)] shadow-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 font-bold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </AuthForm>
  );
}
