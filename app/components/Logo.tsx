import { Link } from 'react-router';

// Dalab Online brand mark: a shopping bag with a forward arrow ("dalab" = order).
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Dalab Online">
      <rect width="48" height="48" rx="12" fill="#4189DD" />
      <path
        d="M17 18v-2.5a7 7 0 0 1 14 0V18"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M11.5 18h25l-2 20.5a3 3 0 0 1-3 2.5h-15a3 3 0 0 1-3-2.5z" fill="#FFFFFF" />
      <path
        d="M18 30h11m-4-4.5 4.5 4.5-4.5 4.5"
        fill="none"
        stroke="#FFB020"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  to?: string;
  light?: boolean;
  className?: string;
}

// Mark + "Dalab Online" wordmark. `light` renders the wordmark for dark backgrounds.
export default function Logo({ to = '/', light = false, className = '' }: LogoProps) {
  return (
    <Link to={to} className={`flex items-center gap-2 shrink-0 ${className}`} aria-label="Dalab Online home">
      <LogoMark />
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-[#0B1F3A]'}`}>
        Dalab<span className="text-[#4189DD]"> Online</span>
      </span>
    </Link>
  );
}
