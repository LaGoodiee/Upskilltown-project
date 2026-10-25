import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CONFIG, formatUSD, formatNaira, getWhatsAppUrl } from '../data';
import { FirebaseStatusBanner } from './FirebaseStatusBanner';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface TeamClient {
  id: string;
  clientName: string;
  repName: string;
  service: string;
  amount: number;
  status: 'Paid' | 'In Consultation' | 'Proposal Sent';
  date: string;
}

const SAMPLE_TEAM_CLIENTS: TeamClient[] = [
  { id: '1', clientName: 'Summit Capital Partners', repName: 'Samuel O.', service: 'Multi-Page Website', amount: 67000, status: 'Paid', date: 'Oct 24, 2026' },
  { id: '2', clientName: 'Optima Health Clinic', repName: 'Chioma A.', service: 'Landing Page', amount: 45000, status: 'Paid', date: 'Oct 23, 2026' },
  { id: '3', clientName: 'Prestige Architecture Studio', repName: 'David E.', service: 'Portfolio Website', amount: 35000, status: 'In Consultation', date: 'Oct 22, 2026' },
  { id: '4', clientName: 'Vanguard Cargo Logistics', repName: 'Samuel O.', service: 'Multi-Page Website', amount: 67000, status: 'Paid', date: 'Oct 21, 2026' },
  { id: '5', clientName: 'Nile Clean Energy', repName: 'Blessing U.', service: 'Landing Page', amount: 45000, status: 'Proposal Sent', date: 'Oct 20, 2026' },
];

export const TeamPortalPage: React.FC = () => {
  useScrollReveal();
  const { previewMode } = useApp();

  const [clients, setClients] = useState<TeamClient[]>(SAMPLE_TEAM_CLIENTS);
  const [repName, setRepName] = useState('');
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('Multi-Page Website');
  const [amount, setAmount] = useState('67000');
  const [feedback, setFeedback] = useState('');

  const target = CONFIG.team.min; // 150
  const currentCount = previewMode ? 84 : clients.filter(c => c.status === 'Paid').length;
  const progressPercent = Math.min(100, Math.round((currentCount / target) * 100));

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !clientName.trim()) {
      setFeedback('Please enter both the representative and client names.');
      return;
    }

    const newClient: TeamClient = {
      id: String(Date.now()),
      clientName: clientName.trim(),
      repName: repName.trim(),
      service,
      amount: parseInt(amount, 10) || 45000,
      status: 'Paid',
      date: 'Today',
    };

    setClients([newClient, ...clients]);
    setClientName('');
    setFeedback(`✓ Client "${newClient.clientName}" registered to team pipeline!`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="w-container py-12 md:py-16 pb-24">
      {/* Yellow Notice & Preview Mode Toggle if Keys Empty */}
      <FirebaseStatusBanner />

      {/* Header */}
      <div className="pb-8">
        <div className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Sales Team & Agency Portal {previewMode && <span className="text-[#ff4800] ml-1">[Sample Data]</span>}
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          <span className="ln" style={{ '--i': 0 } as React.CSSProperties}>
            <span>Agency & Sales</span>
          </span>
          <span className="ln" style={{ '--i': 1 } as React.CSSProperties}>
            <span style={{ color: 'var(--mut)' }}>Team Workspace.</span>
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-[var(--mut)] my-6 leading-relaxed">
          Track high-volume sales targets, monitor agent performance, and review tiered commissions across your team pipeline.
        </p>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">31 Dec Quota Progress</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#ff4800]">
              {currentCount}{' '}
              <span className="text-base text-[var(--mut)] font-bold">/ {target}</span>
            </span>
            <div className="w-full h-2 rounded-full bg-[var(--bg)] mt-2 overflow-hidden border border-[var(--line)]">
              <div
                className="h-full bg-[#ff4800] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-[var(--mut)]">{progressPercent}% of target reached</span>
        </div>

        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Current Commission Tier</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)]">
              20%
            </span>
            <small className="block text-xs font-bold text-[#ff4800] mt-0.5">Tier 1 Active (150+)</small>
          </div>
          <span className="text-xs text-[var(--mut)]">Next tier: 25% at 300 clients</span>
        </div>

        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Active Sales Reps</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)]">
              {previewMode ? '6' : '1'}
            </span>
            <small className="block text-xs text-[var(--mut)] mt-0.5">Assigned agents</small>
          </div>
          <span className="text-xs text-[var(--mut)]">All sales synchronized</span>
        </div>

        <div className="agency-card p-6 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-[var(--mut)]">Estimated Team Commission</span>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#ff4800]">
              {previewMode ? formatNaira(780000) : formatNaira(45000)}
            </span>
            <small className="block text-xs text-[var(--mut)] mt-0.5">
              {previewMode ? `~${formatUSD(780000)}` : `~${formatUSD(45000)}`}
            </small>
          </div>
          <span className="text-xs text-emerald-500 font-semibold">Processed within 48h</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Register Team Client Form */}
        <div className="agency-card p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📝</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">
              Log Team Client
            </h2>
          </div>
          <p className="text-xs text-[var(--mut)] mb-5">
            Add a newly closed client to allocate credit to your sales rep and count toward the team bonus.
          </p>

          <form onSubmit={handleRegisterClient} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              <span>Sales Representative <span className="text-[#ff4800]">*</span></span>
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="e.g. Samuel Okafor"
                className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold">
              <span>Client / Business Name <span className="text-[#ff4800]">*</span></span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold">
              <span>Service Ordered</span>
              <select
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  if (e.target.value === 'Multi-Page Website') setAmount('67000');
                  else if (e.target.value === 'Landing Page') setAmount('45000');
                  else setAmount('35000');
                }}
                className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              >
                <option>Multi-Page Website</option>
                <option>Landing Page</option>
                <option>Portfolio Website</option>
              </select>
            </label>

            {feedback && (
              <div className="text-emerald-500 font-semibold text-xs">{feedback}</div>
            )}

            <button
              type="submit"
              className="agency-btn p w-full min-h-[44px] text-xs font-bold mt-2"
            >
              Add to Team Pipeline
            </button>
          </form>
        </div>

        {/* Team Pipeline Table */}
        <div className="agency-card lg:col-span-2 p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b gap-2" style={{ borderColor: 'var(--line)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">
                  Recent Team Client Registrations
                </h2>
              </div>
              <p className="text-xs text-[var(--mut)] mt-0.5">
                Verified deals qualifying for the {CONFIG.team.deadline} quota
              </p>
            </div>
            <span className="text-xs text-[var(--mut)]">
              Showing {clients.length} entries
            </span>
          </div>

          <div className="divide-y overflow-x-auto" style={{ borderColor: 'var(--line)' }}>
            {clients.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm min-w-[320px]">
                <div>
                  <b className="text-[var(--fg)] block">{c.clientName}</b>
                  <span className="text-xs text-[var(--mut)]">Rep: {c.repName} · {c.service}</span>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-bold text-[var(--fg)] block">{formatNaira(c.amount)}</span>
                    <span className="text-[11px] text-[var(--mut)]">{c.date}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--mut)]" style={{ borderColor: 'var(--line)' }}>
            <span>Commission is paid directly via bank transfer within 48 hours.</span>
            <a
              href={getWhatsAppUrl('Hello Upskilltown Agency, I would like to review our sales team quota.')}
              target="_blank"
              rel="noopener noreferrer"
              className="agency-btn text-xs"
            >
              Contact Agency Lead on WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
