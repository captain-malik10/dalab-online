import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import PhoneInput from '../components/PhoneInput';
import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const { register, loading, error, success } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password, phone, role: 'customer' });
  };

  return (
    <AuthForm
      title="Create Account"
      description="Let's get you started!"
      onSubmit={handleSubmit}
      footerText="Have an account?"
      footerLink="/login"
      footerLinkText="Login"
      error={error}
      success={success}
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
        <label htmlFor="name" className="sr-only">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full px-3 py-2 mt-1 rounded bg-[var(--color-background)] text-[var(--color-dark)] shadow-sm"
          required
        />
      </div>
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
      <div>
        <label htmlFor="phone" className="sr-only">
          Phone
        </label>
        <PhoneInput value={phone} onChange={setPhone} />
      </div>
      <button
        type="submit"
        className="w-full py-2 font-bold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </AuthForm>
  );
}
