import React, { useState, useMemo, useEffect } from 'react';
import {
  CONFIG,
  formatUSD,
  formatFullFx,
  formatNaira,
  getWhatsAppUrl,
} from '../data';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { submitPartnerApplication } from '../firebase';

export const AffiliatesSection: React.FC = () => {
  // Activate scroll reveal animations
  useScrollReveal();

  // Math challenge anti-bot state
  const [mathA, setMathA] = useState(5);
  const [mathB, setMathB] = useState(7);

  useEffect(() => {
    setMathA(1 + Math.floor(Math.random() * 8));
    setMathB(1 + Math.floor(Math.random() * 8));
  }, []);

  // Individual affiliate application state
  const [affiliateForm, setAffiliateForm] = useState({
    name: '',
    phone: '',
    platform: '',
    reach: '',
    reason: '',
    mathAnswer: '',
    agreed: false,
  });
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submittingAffiliate, setSubmittingAffiliate] = useState(false);
  const [affiliateSuccess, setAffiliateSuccess] = useState<string | null>(null);

  // Sales team application state
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    leadName: '',
    phone: '',
    teamSize: '',
    targetRange: '',
    pitch: '',
  });
  const [teamError, setTeamError] = useState('');
  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  // Client registration state
  const [regForm, setRegForm] = useState({
    affiliateName: '',
    affiliatePhone: '',
    clientName: '',
    clientPhone: '',
  });
  const [regError, setRegError] = useState('');

  // Team pay estimator
  const [clientEstimateCount, setClientEstimateCount] = useState<number>(150);

  const { avgSale, avgAffiliatePay } = useMemo(() => {
    const allOptionsPrices = Object.values(CONFIG.services).flatMap((s) =>
      Object.values(s.options).map((o) => o.naira)
    );
    const avgSaleVal = Math.round(
      allOptionsPrices.reduce((a, b) => a + b, 0) / allOptionsPrices.length
    );

    const avgAffVal = Math.round(
      CONFIG.pay.reduce((a, b) => a + b.perClient, 0) / CONFIG.pay.length
    );

    return { avgSale: avgSaleVal, avgAffiliatePay: avgAffVal };
  }, []);

  const getTeamRate = (count: number) => {
    let rate = 0;
    CONFIG.team.tiers.forEach((t) => {
      if (count >= t.min) {
        rate = t.percent;
      }
    });
    return rate;
  };

  const calculatedTeamRate = getTeamRate(clientEstimateCount);
  const calculatedTeamPay = calculatedTeamRate
    ? Math.round((clientEstimateCount * avgSale * calculatedTeamRate) / 100)
    : clientEstimateCount * avgAffiliatePay;

  const isAffiliateFormValid = useMemo(() => {
    const phoneDigits = affiliateForm.phone.replace(/\D/g, '');
    const isMathCorrect = parseInt(affiliateForm.mathAnswer, 10) === mathA + mathB;
    return (
      affiliateForm.name.trim().length > 1 &&
      phoneDigits.length >= 10 &&
      Boolean(affiliateForm.platform) &&
      affiliateForm.reach.trim().length > 0 &&
      affiliateForm.reason.trim().length >= 30 &&
      isMathCorrect &&
      affiliateForm.agreed
    );
  }, [affiliateForm, mathA, mathB]);

  const handleAffiliateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAffiliateFormValid) return;

    setSubmittingAffiliate(true);
    setAffiliateSuccess(null);

    const randomCode = `${CONFIG.prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setRegisteredCode(randomCode);

    // Save directly to Firestore applications collection
    const res = await submitPartnerApplication({
      type: 'individual_affiliate',
      applicantName: affiliateForm.name.trim(),
      phone: affiliateForm.phone.trim(),
      platform: affiliateForm.platform,
      reach: affiliateForm.reach.trim(),
      pitch: affiliateForm.reason.trim(),
      generatedCode: randomCode,
    });

    setSubmittingAffiliate(false);

    if (res.success) {
      setAffiliateSuccess(
        `Application received and saved to Firestore! Code: ${randomCode}. Reviewable in Admin.`
      );
    } else {
      setAffiliateSuccess(
        `Application recorded locally! (Note: ${res.error || 'Saved in local buffer'}).`
      );
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = teamForm.phone.replace(/\D/g, '');
    if (
      teamForm.teamName.trim().length < 2 ||
      teamForm.leadName.trim().length < 2 ||
      phoneDigits.length < 10 ||
      !teamForm.teamSize.trim() ||
      !teamForm.targetRange ||
      teamForm.pitch.trim().length < 30
    ) {
      setTeamError(
        'Fill in every field, with a valid WhatsApp number and at least 30 characters about how you sell.'
      );
      return;
    }
    setTeamError('');
    setSubmittingTeam(true);
    setTeamSuccess(null);

    // Save directly to Firestore
    const res = await submitPartnerApplication({
      type: 'sales_team',
      applicantName: teamForm.teamName.trim(),
      teamName: teamForm.teamName.trim(),
      leadName: teamForm.leadName.trim(),
      phone: teamForm.phone.trim(),
      teamSize: teamForm.teamSize.trim(),
      targetRange: teamForm.targetRange,
      pitch: teamForm.pitch.trim(),
    });

    setSubmittingTeam(false);

    if (res.success) {
      setTeamSuccess(
        'Team application saved to Firestore! Our leadership team will review it in the Admin panel.'
      );
      setTeamForm({
        teamName: '',
        leadName: '',
        phone: '',
        teamSize: '',
        targetRange: '',
        pitch: '',
      });
    } else {
      setTeamSuccess('Application saved to local session.');
    }
  };

  const handleRegClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aPhoneDigits = regForm.affiliatePhone.replace(/\D/g, '');
    const cPhoneDigits = regForm.clientPhone.replace(/\D/g, '');

    if (
      regForm.affiliateName.trim().length < 2 ||
      regForm.clientName.trim().length < 2 ||
      aPhoneDigits.length < 10 ||
      cPhoneDigits.length < 10
    ) {
      setRegError('Fill in all four fields with valid phone numbers.');
      return;
    }
    setRegError('');

    const message = [
      'Affiliate client registration',
      `Affiliate: ${regForm.affiliateName.trim()}`,
      `Affiliate phone: ${regForm.affiliatePhone.trim()}`,
      `Client: ${regForm.clientName.trim()}`,
      `Client phone: ${regForm.clientPhone.trim()}`,
    ].join('\n');

    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const referralLink = registeredCode
    ? `${window.location.origin}/#offer?ref=${registeredCode}`
    : '';

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareReferralOnWhatsApp = () => {
    if (!registeredCode) return;
    const shareText = `Hey! Need a high-converting website or landing page for your brand? Upskilltown Agency builds world-class websites. Check them out here: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-container pb-20">
      {/* Hero Section with staggered line reveals */}
      <div className="hero">
        <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Open to everyone · closes at 50 affiliates
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold tracking-[-0.045em] leading-[0.98]">
          <span className="ln" style={{ '--i': 0 } as React.CSSProperties}>
            <span>Refer a client.</span>
          </span>
          <span className="ln" style={{ '--i': 1 } as React.CSSProperties}>
            <span style={{ color: 'var(--mut)' }}>Get paid.</span>
          </span>
        </h1>

        <p className="max-w-[560px] text-base sm:text-lg md:text-[19px] text-[var(--mut)] my-7 leading-relaxed">
          Our affiliate system is very simple. No matter who you are, you get paid when a client you referred signs up.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const el = document.getElementById('apply');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="agency-btn p text-sm"
          >
            Become an affiliate
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('team');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="agency-btn text-sm"
          >
            Sales teams: partner with us
          </button>
        </div>
      </div>

      {/* Pay Cards Grid with .rv scroll reveal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {CONFIG.pay.map((p, idx) => (
          <div
            key={idx}
            className="agency-card rv flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--mut)] mb-6">{p.service}</p>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#ff4800] leading-none">
                {formatUSD(p.perClient)}
                <small className="block text-xs font-semibold text-[var(--mut)] mt-1.5">
                  {formatFullFx(p.perClient)}
                </small>
              </div>
              <p className="text-sm font-bold text-[var(--fg)] mt-2">per client</p>
            </div>

            <div className="border-t pt-4 mt-6" style={{ borderColor: 'var(--line)' }}>
              <b className="text-base sm:text-lg font-bold text-[var(--fg)] block">
                Up to {formatUSD(p.maxMonthly)} a month
              </b>
              <small className="block text-xs text-[var(--mut)] mt-0.5">
                {formatFullFx(p.maxMonthly)}
              </small>
              <p className="text-xs text-[var(--mut)] mt-1">Bring in one client every day.</p>
            </div>
          </div>
        ))}
      </div>

      {/* Christmas Gift Banner with animated floating 🎁 emoji */}
      <div className="my-10">
        <div className="xmas rv">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Best affiliate wins a Christmas gift.
            </h2>
            <p className="text-sm sm:text-base opacity-95 mt-4 leading-relaxed font-medium">
              {formatUSD(200000)} ({formatFullFx(200000)}) or a brand new laptop for the affiliate with the most paying clients.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Steps with animated glowing track, dot, lit icons & POPPING COIN */}
      <div className="py-12 md:py-16">
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          How it works
        </h2>

        <div className="steps rv">
          {/* Animated dashed line with traveling glow dot */}
          <div className="trk" />

          {/* Animated popping coin badge (+₦10,000) */}
          <div className="coin">
            +₦10,000
          </div>

          {[
            { icon: '📋', title: 'Apply', desc: 'Join in a minute' },
            { icon: '🔗', title: 'Share your link', desc: 'Send it to a client' },
            { icon: '🤝', title: 'Client signs up', desc: 'They order with your code' },
            { icon: '💰', title: 'You get paid', desc: 'After their payment' },
          ].map((step, idx) => (
            <div key={idx} className="st" style={{ '--i': idx } as React.CSSProperties}>
              <div className="ic">{step.icon}</div>
              <b>{step.title}</b>
              <small>{step.desc}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Team Section with .rv reveal */}
      <div id="team" className="py-12 md:py-16">
        <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          For sales teams and agencies
        </span>
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          Got a sales team? Let’s work together.
        </h2>
        <p className="text-[var(--mut)] max-w-2xl mt-3 text-base leading-relaxed">
          Run a sales team or agency? Bring in {CONFIG.team.min} or more paying clients by {CONFIG.team.deadline} and your team earns a percentage of every sale, not the standard affiliate pay.
        </p>

        {/* Tiers Grid with .rv */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="agency-card rv">
            <p className="text-sm font-semibold text-[var(--mut)] mb-6">Under 150 clients</p>
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)] leading-tight">
              Standard pay
            </div>
            <p className="text-xs text-[var(--mut)] mt-3">
              You still earn the normal per-client affiliate pay on every client.
            </p>
          </div>

          <div className="agency-card rv border-[#ff4800]">
            <p className="text-sm font-semibold text-[var(--mut)] mb-6">150 to 299 clients</p>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#ff4800] leading-tight">
              20%
              <small className="block text-xs font-bold text-[var(--fg)] mt-1">of every sale</small>
            </div>
            <p className="text-xs text-[var(--mut)] mt-3">
              Once you reach 150, we top up every client you brought to this rate.
            </p>
          </div>

          <div className="agency-card rv border-[#ff4800]">
            <p className="text-sm font-semibold text-[var(--mut)] mb-6">300+ clients</p>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#ff4800] leading-tight">
              25%
              <small className="block text-xs font-bold text-[var(--fg)] mt-1">of every sale</small>
            </div>
            <p className="text-xs text-[var(--mut)] mt-3">
              Once you reach 300, we top up every client you brought to this rate.
            </p>
          </div>
        </div>

        {/* Interactive Estimator & Requirements Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 items-start">
          <div className="agency-card">
            <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
              Estimate your team’s pay
            </h3>
            <p className="text-sm text-[var(--mut)] mt-1">
              Enter how many paying clients your team could bring in by the deadline.
            </p>

            <div className="mt-5">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>Paying clients</span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={clientEstimateCount}
                  onChange={(e) => setClientEstimateCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={clientEstimateCount}
                onChange={(e) => setClientEstimateCount(parseInt(e.target.value, 10))}
                className="w-full accent-[#ff4800] mt-4 cursor-pointer"
              />

              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border-2 border-dashed border-[#ff4800] mt-4"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <span className="font-bold text-sm text-[var(--fg)]">
                  Estimated pay:
                </span>
                <div className="text-left sm:text-right mt-1 sm:mt-0">
                  <b className="text-2xl sm:text-3xl font-extrabold text-[#ff4800]">
                    {formatUSD(calculatedTeamPay)}
                  </b>
                  <small className="block text-xs font-semibold text-[var(--mut)]">
                    {formatFullFx(calculatedTeamPay)}
                  </small>
                </div>
              </div>

              <p className="text-xs text-[var(--mut)] mt-3 leading-relaxed">
                {calculatedTeamRate
                  ? `At ${calculatedTeamRate}% of an average sale of ${formatNaira(avgSale)}.`
                  : `Below ${CONFIG.team.min} clients, standard affiliate pay applies (average ${formatNaira(avgAffiliatePay)} per client).`}{' '}
                This is an estimate. Real pay depends on the packages your clients choose.
              </p>
            </div>
          </div>

          <div className="agency-card">
            <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
              What we’re looking for
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--mut)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#ff4800] font-bold">✓</span>
                <span>A team or agency with a real sales process, not just one person.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff4800] font-bold">✓</span>
                <span>Able to bring in at least 150 paying clients by 31 December 2026.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff4800] font-bold">✓</span>
                <span>Clients are real and each one pays in full.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff4800] font-bold">✓</span>
                <span>Your team uses the same prices and packages as everyone else.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff4800] font-bold">✓</span>
                <span>You share each client’s name and phone number with us when they order.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff4800] font-bold">✓</span>
                <span>Sales teams are separate from the 50-member individual affiliate list.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sales Team Application Form */}
        <div className="agency-card mt-5">
          <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
            Apply as a sales team
          </h3>
          <p className="text-sm text-[var(--mut)] mt-1">
            Tell us about your team. We’ll review it and reply on WhatsApp with the next steps and a short written agreement.
          </p>

          <form onSubmit={handleTeamSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Team or agency name <span className="text-[#ff4800]">*</span></span>
              <input
                type="text"
                value={teamForm.teamName}
                onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                placeholder="e.g. Skyline Sales Agency"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Team lead’s name <span className="text-[#ff4800]">*</span></span>
              <input
                type="text"
                value={teamForm.leadName}
                onChange={(e) => setTeamForm({ ...teamForm, leadName: e.target.value })}
                placeholder="e.g. Samuel Okafor"
                autoComplete="name"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>WhatsApp number <span className="text-[#ff4800]">*</span></span>
              <input
                type="tel"
                value={teamForm.phone}
                onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                placeholder="e.g. 08123456789"
                autoComplete="tel"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>People on your team <span className="text-[#ff4800]">*</span></span>
              <input
                type="number"
                value={teamForm.teamSize}
                onChange={(e) => setTeamForm({ ...teamForm, teamSize: e.target.value })}
                placeholder="e.g. 6"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
              <span>Clients you can bring in by 31 December <span className="text-[#ff4800]">*</span></span>
              <select
                value={teamForm.targetRange}
                onChange={(e) => setTeamForm({ ...teamForm, targetRange: e.target.value })}
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800] cursor-pointer"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              >
                <option value="">Choose one</option>
                <option value="150 to 299">150 to 299</option>
                <option value="300 to 499">300 to 499</option>
                <option value="500 or more">500 or more</option>
              </select>
            </label>

            <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
              <span>How does your team sell, and where? (30+ characters) <span className="text-[#ff4800]">*</span></span>
              <textarea
                value={teamForm.pitch}
                onChange={(e) => setTeamForm({ ...teamForm, pitch: e.target.value })}
                className="w-full min-h-[100px] p-4 rounded-2xl border text-sm focus:border-[#ff4800] resize-y"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            {teamError && (
              <div className="md:col-span-2 text-red-500 font-semibold text-sm">
                {teamError}
              </div>
            )}

            {teamSuccess && (
              <div className="md:col-span-2 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-sm font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span>✓ {teamSuccess}</span>
                <a
                  href={getWhatsAppUrl('Sales team application: Applied on site and saved to Firestore')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agency-btn text-xs py-2 px-3 whitespace-nowrap cursor-pointer"
                >
                  Optional: Message Admin
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingTeam}
              className="agency-btn p md:col-span-2 min-h-[48px] text-base cursor-pointer disabled:opacity-50"
            >
              {submittingTeam ? 'Submitting to Database...' : 'Submit Team Application'}
            </button>
          </form>
        </div>
      </div>

      {/* Individual Affiliate Application Section */}
      <div id="apply" className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="agency-card">
            <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
              Apply to join
            </h3>
            <p className="text-sm text-[var(--mut)] mt-1 leading-relaxed">
              We use this to keep out spam and unserious applications. The affiliate team closes once it reaches 50 members, so apply early.
            </p>

            <form onSubmit={handleAffiliateSubmit} className="flex flex-col gap-4 mt-6">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>Full name <span className="text-[#ff4800]">*</span></span>
                <input
                  type="text"
                  value={affiliateForm.name}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
                  autoComplete="name"
                  className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>WhatsApp number <span className="text-[#ff4800]">*</span></span>
                <input
                  type="tel"
                  value={affiliateForm.phone}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, phone: e.target.value })}
                  inputMode="tel"
                  className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>Where will you promote? <span className="text-[#ff4800]">*</span></span>
                <select
                  value={affiliateForm.platform}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, platform: e.target.value })}
                  className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800] cursor-pointer"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                >
                  <option value="">Choose one</option>
                  <option value="WhatsApp status/groups">WhatsApp status/groups</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="In person / network">In person / network</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>How many people can you reach? <span className="text-[#ff4800]">*</span></span>
                <input
                  type="text"
                  value={affiliateForm.reach}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, reach: e.target.value })}
                  className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>Why should we approve you? (30+ characters) <span className="text-[#ff4800]">*</span></span>
                <textarea
                  value={affiliateForm.reason}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, reason: e.target.value })}
                  className="w-full min-h-[90px] p-4 rounded-2xl border text-sm focus:border-[#ff4800] resize-y"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>
                  Quick check: what is {mathA} + {mathB}? <span className="text-[#ff4800]">*</span>
                </span>
                <input
                  type="number"
                  value={affiliateForm.mathAnswer}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, mathAnswer: e.target.value })}
                  className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[var(--fg)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={affiliateForm.agreed}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, agreed: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#ff4800] mt-0.5 cursor-pointer"
                />
                <span className="leading-snug text-[var(--mut)]">
                  I agree to the rules and understand fake referrals are disqualified.
                </span>
              </label>

              <button
                type="submit"
                disabled={!isAffiliateFormValid || submittingAffiliate}
                className="agency-btn p w-full min-h-[48px] text-sm cursor-pointer disabled:opacity-50"
              >
                {submittingAffiliate ? 'Saving to Database...' : 'Submit Affiliate Application'}
              </button>
            </form>

            {/* Generated Affiliate Dashboard with smooth reveal */}
            {registeredCode && (
              <div
                className="mt-6 p-5 rounded-2xl border border-[#ff4800] animate-in fade-in"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                {affiliateSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold">
                    ✓ {affiliateSuccess}
                  </div>
                )}

                <b className="text-sm font-bold text-[var(--fg)] block mb-1">You’re in. Your referral code:</b>
                <code
                  className="block text-base font-mono font-bold p-3 rounded-xl border mb-3 tracking-wider text-[#ff4800]"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--line)' }}
                >
                  {registeredCode}
                </code>

                <b className="text-sm font-bold text-[var(--fg)] block mb-1">Your referral link:</b>
                <code
                  className="block text-xs font-mono p-3 rounded-xl border mb-4 break-all text-[var(--fg)]"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--line)' }}
                >
                  {referralLink}
                </code>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyReferralLink}
                    className="agency-btn flex-1 min-h-[42px] text-xs"
                  >
                    {copiedLink ? '✓ Link Copied!' : 'Copy link'}
                  </button>
                  <button
                    onClick={shareReferralOnWhatsApp}
                    className="agency-btn p flex-1 min-h-[42px] text-xs"
                  >
                    Share on WhatsApp
                  </button>
                </div>
                <p className="text-xs text-[var(--mut)] mt-3">
                  Send the link to your client, or ask them to mention your code when ordering.
                </p>
              </div>
            )}
          </div>

          {/* Right Side: Register client + Payout steps + Rules */}
          <div className="flex flex-col gap-5">
            <div className="agency-card">
              <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
                Register your client
              </h3>
              <p className="text-sm text-[var(--mut)] mt-1 leading-relaxed">
                Brought a client? Send us their name and phone number. When they order, we match their details to you.
              </p>

              <form onSubmit={handleRegClientSubmit} className="flex flex-col gap-3.5 mt-4">
                <label className="flex flex-col gap-1 text-xs font-semibold">
                  <span>Your name</span>
                  <input
                    type="text"
                    value={regForm.affiliateName}
                    onChange={(e) => setRegForm({ ...regForm, affiliateName: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold">
                  <span>Your phone number</span>
                  <input
                    type="tel"
                    value={regForm.affiliatePhone}
                    onChange={(e) => setRegForm({ ...regForm, affiliatePhone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold">
                  <span>Client’s name</span>
                  <input
                    type="text"
                    value={regForm.clientName}
                    onChange={(e) => setRegForm({ ...regForm, clientName: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold">
                  <span>Client’s phone number</span>
                  <input
                    type="tel"
                    value={regForm.clientPhone}
                    onChange={(e) => setRegForm({ ...regForm, clientPhone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  />
                </label>

                {regError && (
                  <div className="text-red-500 font-semibold text-xs">{regError}</div>
                )}

                <button
                  type="submit"
                  className="agency-btn k w-full mt-2 min-h-[44px] text-xs"
                >
                  Register client on WhatsApp
                </button>
              </form>
            </div>

            <div className="agency-card">
              <h3 className="text-xl font-bold tracking-tight text-[var(--fg)]">
                Payout steps
              </h3>
              <ol className="mt-3 space-y-2 text-sm text-[var(--mut)] list-decimal list-inside leading-relaxed">
                <li>Register your client’s name and phone number</li>
                <li>Client orders and we match their details</li>
                <li>Client pays</li>
                <li>You get paid within 48 hours</li>
              </ol>
            </div>

            <div className="agency-card">
              <h3 className="text-xl font-bold tracking-tight text-[var(--fg)]">
                Rules
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[var(--mut)] list-disc list-inside leading-relaxed">
                <li>Only real, paying clients count.</li>
                <li>The affiliate team is capped at 50 members. Applications close once it’s full.</li>
                <li>Register each client’s name and phone number with us before or when they order.</li>
                <li>No spam or fake leads. Self-referrals don’t count.</li>
                <li>Payout is made after the client’s payment is confirmed.</li>
                <li>Best affiliate is decided by confirmed paying clients. Upskilltown Agency makes the final call.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
