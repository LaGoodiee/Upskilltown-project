import React, { useState } from 'react';
import { getWhatsAppUrl } from '../data';
import { AppRoute } from '../types';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  currentTab: AppRoute;
  onSelectTab: (tab: AppRoute) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useApp();

  const handleNavClick = (tab: AppRoute) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="w-container flex items-center justify-between h-16 gap-3">
        {/* Brand Logo */}
        <a
          href="#offer"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('offer');
          }}
          className="flex items-center gap-2.5 font-extrabold tracking-tight select-none mr-auto"
          aria-label="Upskilltown Agency"
        >
          <svg viewBox="0 0 100 100" className="w-10 h-10" aria-hidden="true">
            <rect width="100" height="100" rx="32" fill="#FF4800" />
            <path
              d="M28 46V57A22 22 0 0 0 72 57V26M56 42L72 26L88 42"
              stroke="#FFFFFF"
              strokeWidth="13"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="28" cy="25" r="8" fill="#14110F" />
          </svg>
          <div className="grid leading-none">
            <b className="text-[21px] font-extrabold tracking-tighter" style={{ color: 'var(--fg)' }}>
              Upskilltown
            </b>
            <small className="text-[8px] font-bold tracking-[0.45em] uppercase text-[#ff4800] mt-1">
              AGENCY
            </small>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => handleNavClick('offer')}
            className={`px-3.5 py-1.5 rounded-full font-medium text-sm transition-all cursor-pointer ${
              currentTab === 'offer'
                ? 'bg-[var(--card)] text-[var(--fg)] shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--fg)] hover:bg-[var(--card)]/60'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('affiliates')}
            className={`px-3.5 py-1.5 rounded-full font-medium text-sm transition-all cursor-pointer ${
              currentTab === 'affiliates'
                ? 'bg-[var(--card)] text-[var(--fg)] shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--fg)] hover:bg-[var(--card)]/60'
            }`}
          >
            Affiliates
          </button>
          <button
            onClick={() => handleNavClick('proof')}
            className={`px-3.5 py-1.5 rounded-full font-medium text-sm transition-all cursor-pointer ${
              currentTab === 'proof'
                ? 'bg-[var(--card)] text-[var(--fg)] shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--fg)] hover:bg-[var(--card)]/60'
            }`}
          >
            Proof of work
          </button>

          {/* Partner login / Dashboard pill button - ALWAYS VISIBLE */}
          <button
            onClick={() => handleNavClick(user ? 'dashboard' : 'login')}
            className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer border ${
              currentTab === 'login' || currentTab === 'dashboard'
                ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-sm'
                : 'border-[#ff4800]/60 text-[#ff4800] hover:bg-[#ff4800] hover:text-white'
            }`}
          >
            {user ? 'Dashboard' : 'Partner login'}
          </button>
        </nav>

        {/* Desktop WhatsApp CTA */}
        <a
          href={getWhatsAppUrl('Hello Upskilltown Agency, I’d like to order a website.')}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex agency-btn p text-sm"
        >
          Order on WhatsApp
        </a>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle light and dark mode"
          className="w-11 h-11 flex items-center justify-center rounded-full border transition-transform hover:-translate-y-0.5 cursor-pointer text-lg"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--line)',
            color: 'var(--fg)',
          }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌓'}
        </button>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-full border transition-transform cursor-pointer text-lg font-bold"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--line)',
            color: 'var(--fg)',
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b px-4 py-4 flex flex-col gap-2 transition-all shadow-lg animate-in fade-in"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--line)',
          }}
        >
          <button
            onClick={() => handleNavClick('offer')}
            className={`text-left px-4 py-3 rounded-2xl font-semibold text-base transition-colors ${
              currentTab === 'offer'
                ? 'bg-[var(--card)] text-[var(--fg)]'
                : 'text-[var(--mut)]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('affiliates')}
            className={`text-left px-4 py-3 rounded-2xl font-semibold text-base transition-colors ${
              currentTab === 'affiliates'
                ? 'bg-[var(--card)] text-[var(--fg)]'
                : 'text-[var(--mut)]'
            }`}
          >
            Affiliates
          </button>
          <button
            onClick={() => handleNavClick('proof')}
            className={`text-left px-4 py-3 rounded-2xl font-semibold text-base transition-colors ${
              currentTab === 'proof'
                ? 'bg-[var(--card)] text-[var(--fg)]'
                : 'text-[var(--mut)]'
            }`}
          >
            Proof of work
          </button>

          {/* Mobile Partner login / Dashboard pill button */}
          <button
            onClick={() => handleNavClick(user ? 'dashboard' : 'login')}
            className={`text-left px-4 py-3 rounded-2xl font-bold text-base transition-colors flex items-center justify-between border ${
              currentTab === 'login' || currentTab === 'dashboard'
                ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                : 'border-[#ff4800]/50 text-[#ff4800] bg-[var(--card)]'
            }`}
          >
            <span>{user ? 'Dashboard' : 'Partner login'}</span>
            <span className="text-xs bg-[#ff4800] text-white px-2.5 py-0.5 rounded-full font-semibold">
              {user ? 'Active' : 'Portal'}
            </span>
          </button>

          <a
            href={getWhatsAppUrl('Hello Upskilltown Agency, I’d like to order a website.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-center py-3 rounded-full font-bold text-white bg-[#ff4800] shadow-md"
          >
            Order on WhatsApp
          </a>
        </div>
      )}
    </header>
  );
};
