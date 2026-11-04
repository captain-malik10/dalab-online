import { Link } from 'react-router';
import AuthMessage from './AuthMessage';

type AuthFormProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  error?: string | null;
  success?: string | null;
  backArrow?: React.ReactNode;
};

export default function AuthForm({
  title,
  description,
  children,
  onSubmit,
  footerText,
  footerLink,
  footerLinkText,
  error,
  success,
  backArrow,
}: AuthFormProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
      <div className="w-full max-w-sm p-8 space-y-6 bg-[var(--color-surface)] rounded shadow-md">
        <div>
          {backArrow}
          <h1 className="text-3xl font-bold text-[var(--color-dark)]">{title}</h1>
          <p className="text-sm text-[var(--color-muted)]">{description}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          {error && <AuthMessage message={error} type="error" />}
          {success && <AuthMessage message={success} type="success" />}
          {children}
        </form>
        <p className="text-sm text-center text-[var(--color-muted)]">
          {footerText}{' '}
          <Link to={footerLink} className="font-medium text-[var(--color-primary)] hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
