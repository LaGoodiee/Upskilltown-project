import React from 'react';

interface ComingSoonPageProps {
  route: 'login' | 'dashboard' | 'team' | 'admin';
  onNavigateHome: () => void;
}

const PAGE_DETAILS: Record<
  'login' | 'dashboard' | 'team' | 'admin',
  { tag: string; title: string; subtitle: string; icon: string }
> = {
  login: {
    tag: 'Authentication',
    title: 'Login',
    subtitle: 'Sign in with your email or Google account to access your portal.',
    icon: '🔐',
  },
  dashboard: {
    tag: 'Affiliate Portal',
    title: 'Dashboard',
    subtitle: 'Track your referred clients, approved signups, and pending payouts.',
    icon: '📊',
  },
  team: {
    tag: 'Agency & Sales Teams',
    title: 'Sales Team',
    subtitle: 'Manage agency pipelines, client rosters, and tiered volume commissions.',
    icon: '👥',
  },
  admin: {
    tag: 'Administration',
    title: 'Admin',
    subtitle: 'Client approvals, affiliate verifications, and system overview.',
    icon: '⚙️',
  },
};

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  route,
  onNavigateHome,
}) => {
  const detail = PAGE_DETAILS[route] || {
    tag: 'Portal',
    title: 'Page',
    subtitle: 'This page is coming soon.',
    icon: '⚡',
  };

  return (
    <div className="w-container py-20 min-h-[65vh] flex items-center justify-center">
      <div className="agency-card max-w-lg w-full text-center p-8 sm:p-12 rv in shadow-sm">
        <span
          className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-5"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--line)',
            color: 'var(--fg)',
          }}
        >
          {detail.tag}
        </span>

        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl border"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--line)',
          }}
        >
          {detail.icon}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-[var(--fg)]">
          {detail.title}
        </h1>

        <p className="text-[var(--mut)] text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
          {detail.subtitle}
        </p>

        <div className="p-4 rounded-2xl border mb-6 inline-block w-full text-xs font-semibold text-[var(--mut)]"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--line)',
          }}
        >
          Coming soon
        </div>

        <div>
          <button
            onClick={onNavigateHome}
            className="agency-btn p text-sm w-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
