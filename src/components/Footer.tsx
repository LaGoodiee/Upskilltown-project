import React from 'react';
import { getWhatsAppUrl } from '../data';

export const Footer: React.FC = () => {
  return (
    <footer
      className="border-t py-12 pb-28 text-sm transition-colors"
      style={{
        borderColor: 'var(--line)',
        color: 'var(--mut)',
      }}
    >
      <div className="w-container flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-[var(--fg)]">Upskilltown Agency</span>
            <span>·</span>
            <span>Websites and landing pages built to convert</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Order any time on WhatsApp: </span>
            <a
              href={getWhatsAppUrl('Hello Upskilltown Agency, I would like to make an inquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#ff4800] hover:underline"
            >
              07068276281
            </a>
          </div>
        </div>

        {/* Short Privacy Note */}
        <div
          className="pt-6 border-t text-xs text-[var(--mut)] leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: 'var(--line)' }}
        >
          <p className="max-w-2xl">
            <strong className="text-[var(--fg)] font-semibold">Privacy Notice:</strong> We value your privacy. Only affiliate names and confirmed paid client counts are stored in a single summary document to rank top performers on the leaderboard. Client phone numbers and project inquiry details are communicated strictly via direct WhatsApp chat and are never stored publicly or shown anywhere on the website.
          </p>
          <span className="text-[11px] whitespace-nowrap bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--line)]">
            🔒 Privacy First · 100% Spark Free
          </span>
        </div>
      </div>
    </footer>
  );
};
