import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUSD, formatNaira, formatFullFx, getWhatsAppUrl } from '../data';
import { fetchTopLeaderboard, LeaderboardEntry } from '../firebase';
import { FirebaseStatusBanner } from './FirebaseStatusBanner';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ReferralRecord {
  id: string;
  clientAlias: string;
  service: string;
  date: string;
  status: 'Paid' | 'Pending';
  commission: number;
}

const SAMPLE_REFERRALS: ReferralRecord[] = [
  { id: '1', clientAlias: 'Tunde A.', service: 'Multi-Page Website', date: 'Oct 23, 2026', status: 'Paid', commission: 10000 },
  { id: '2', clientAlias: 'Chioma N.', service: 'Landing Page', date: 'Oct 20, 2026', status: 'Paid', commission: 5000 },
  { id: '3', clientAlias: 'Kofi M.', service: 'Portfolio Website', date: 'Oct 18, 2026', status: 'Paid', commission: 3000 },
  { id: '4', clientAlias: 'Amina S.', service: 'Landing Page', date: 'Oct 15, 2026', status: 'Paid', commission: 5000 },
  { id: '5', clientAlias: 'Emeka O.', service: 'Multi-Page Website', date: 'Oct 12, 2026', status: 'Pending', commission: 10000 },
];

export const DashboardPage: React.FC = () => {
  useScrollReveal();
  const { previewMode, isFirebaseConfigured } = useApp();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLiveFirestore, setIsLiveFirestore] = useState(false);
  const [copied, setCopied] = useState(false);

  // Single read strictly from "leaderboard/top" to preserve Spark quota
  useEffect(() => {
    let isMounted = true;
    async function loadLeaderboard() {
      setLoading(true);
      const res = await fetchTopLeaderboard();
      if (isMounted) {
        setLeaderboard(res.entries);
        setIsLiveFirestore(res.isLive);
        if (res.updatedAt) {
          setLastUpdated(
            new Date(res.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }
        setLoading(false);
      }
    }
    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const referralCode = 'UPT-7821';
  const referralUrl = `${window.location.origin}/#offer?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-500 font-extrabold flex items-center justify-center text-sm border border-amber-400/40">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-400 font-extrabold flex items-center justify-center text-sm border border-slate-300/40">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 font-extrabold flex items-center justify-center text-sm border border-amber-700/40">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-full bg-[var(--bg)] text-[var(--mut)] font-bold flex items-center justify-center text-sm border"
        style={{ borderColor: 'var(--line)' }}>
        {rank}
      </span>
    );
  };

  return (
    <div className="w-container py-12 md:py-16 pb-24">
      {/* Yellow Notice & Preview Mode Toggle if Keys Empty */}
      <FirebaseStatusBanner />

      {/* Header Banner */}
      <div className="pb-8">
        <div className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Affiliate Dashboard & Standings {previewMode && <span className="text-[#ff4800] ml-1">[Sample Data]</span>}
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          <span className="ln" style={{ '--i': 0 } as React.CSSProperties}>
            <span>Affiliate</span>
          </span>
          <span className="ln" style={{ '--i': 1 } as React.CSSProperties}>
            <span style={{ color: 'var(--mut)' }}>Dashboard.</span>
          </span>
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-[var(--mut)] my-6 leading-relaxed">
          Monitor your referral earnings, share your link, and track your rank on the Christmas Prize leaderboard.
        </p>
      </div>

      {/* 4 Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Total Referrals</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)]">
              {previewMode ? '14' : '0'}
            </span>
            <small className="block text-xs font-semibold text-[var(--mut)] mt-1">Referred clients</small>
          </div>
          <span className="text-xs text-[var(--mut)]">Across all channels</span>
        </div>

        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Confirmed Paid</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#ff4800]">
              {previewMode ? '11' : '0'}
            </span>
            <small className="block text-xs font-semibold text-[var(--mut)] mt-1">Fully paid orders</small>
          </div>
          <span className="text-xs text-emerald-500 font-semibold">Qualifies for leaderboard</span>
        </div>

        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Total Earned</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#ff4800]">
              {previewMode ? formatNaira(110000) : formatNaira(0)}
            </span>
            <small className="block text-xs font-semibold text-[var(--mut)] mt-1">
              {previewMode ? `~${formatUSD(110000)}` : '$0'}
            </small>
          </div>
          <span className="text-xs text-[var(--mut)]">Cumulative commissions</span>
        </div>

        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Pending Payout</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)]">
              {previewMode ? formatNaira(20000) : formatNaira(0)}
            </span>
            <small className="block text-xs font-semibold text-[var(--mut)] mt-1">Next batch</small>
          </div>
          <span className="text-xs text-emerald-500 font-semibold">Paid within 48h</span>
        </div>
      </div>

      {/* Referral Link & Code Sharing Box */}
      <div className="agency-card p-6 sm:p-8 mb-8 border border-[#ff4800]/40 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff4800]">Your Personal Tracking Link</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--fg)] mt-1">
              Share your link & start earning
            </h2>
            <p className="text-xs sm:text-sm text-[var(--mut)] mt-1.5 leading-relaxed">
              When a business orders through your link or quotes your code, we automatically pair them to you for instant payout.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="p-3 rounded-2xl border font-mono text-xs break-all bg-[var(--bg)] flex items-center justify-between gap-3" style={{ borderColor: 'var(--line)' }}>
              <span className="font-bold text-[#ff4800]">{referralCode}</span>
              <span className="text-[var(--mut)]">({referralUrl})</span>
            </div>
            <button
              onClick={copyLink}
              className="agency-btn text-xs whitespace-nowrap"
            >
              {copied ? '✓ Link Copied' : 'Copy link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hey, need a modern business website or landing page? Upskilltown Agency builds world-class websites: ${referralUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="agency-btn p text-xs whitespace-nowrap"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Existing Christmas Reward Banner */}
      <div className="my-8">
        <div className="xmas rv in">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
              Annual Affiliate Prize
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Best affiliate wins a Christmas gift.
            </h2>
            <p className="text-sm sm:text-base opacity-95 mt-4 leading-relaxed font-medium">
              {formatUSD(200000)} ({formatFullFx(200000)}) or a brand new laptop for the affiliate with the most paying clients.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-8">
        {/* Top 10 Affiliates Leaderboard */}
        <div className="agency-card lg:col-span-2 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 mb-4 border-b gap-3" style={{ borderColor: 'var(--line)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--fg)]">
                  Top 10 Affiliates Leaderboard
                </h2>
              </div>
              <p className="text-xs text-[var(--mut)] mt-1">
                Ranked solely by confirmed paid client orders · Names only
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--mut)]">
              <span className={`w-2 h-2 rounded-full ${isLiveFirestore ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>
                {isLiveFirestore
                  ? `Live Firestore (doc: leaderboard/top)`
                  : previewMode ? `Sample Rankings [Preview]` : `Offline Mode`}
              </span>
              {lastUpdated && <span>· Updated {lastUpdated}</span>}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {loading ? (
              <div className="py-12 text-center text-sm text-[var(--mut)]">
                Loading verified standings...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--mut)]">
                No affiliates ranked yet. Be the first to bring a paying client!
              </div>
            ) : (
              leaderboard.slice(0, 10).map((entry, idx) => {
                const rank = idx + 1;
                const isFirst = rank === 1;

                return (
                  <div
                    key={idx}
                    className={`py-3.5 px-3 flex items-center justify-between rounded-2xl transition-colors ${
                      isFirst ? 'bg-[#ff4800]/5 font-semibold' : 'hover:bg-[var(--bg)]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {getRankBadge(rank)}
                      <div>
                        <span className="text-sm sm:text-base font-bold text-[var(--fg)]">
                          {entry.name}
                        </span>
                        {isFirst && (
                          <span className="ml-2 bg-[#ff4800] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block">
                            Leader
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-[#ff4800]">
                        {entry.paidCount}{' '}
                        <small className="text-xs font-semibold text-[var(--mut)]">
                          {entry.paidCount === 1 ? 'paid' : 'paid clients'}
                        </small>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Client Activity Feed */}
        <div className="agency-card p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-bold tracking-tight text-[var(--fg)]">
              Your Client Feed
            </h2>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {(previewMode ? SAMPLE_REFERRALS : []).map((ref) => (
              <div key={ref.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <b className="text-[var(--fg)] block">{ref.clientAlias}</b>
                  <span className="text-[var(--mut)]">{ref.service}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#ff4800] block">{formatNaira(ref.commission)}</span>
                  <span className={`text-[10px] font-semibold ${ref.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {ref.status}
                  </span>
                </div>
              </div>
            ))}

            {!previewMode && (
              <div className="py-8 text-center text-xs text-[var(--mut)]">
                No client referrals recorded yet. Share your link above to get started!
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
            <a
              href="#affiliates"
              className="agency-btn text-xs w-full justify-center"
            >
              Register Client Pre-Order →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
