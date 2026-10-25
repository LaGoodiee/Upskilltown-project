import React, { useState, useEffect, useRef } from 'react';
import {
  CONFIG,
  formatUSD,
  formatFullFx,
  getWhatsAppUrl,
  TESTIMONIALS,
} from '../data';
import { ServiceKey, TestimonialItem } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface HomeSectionProps {
  onOpenProofModal: (testimonial: TestimonialItem) => void;
  initialService?: ServiceKey;
  initialDomain?: string;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onOpenProofModal,
  initialService = 'landing',
  initialDomain = 'sub',
}) => {
  // Activate scroll reveal animation
  useScrollReveal();

  // Discount counter state
  const [discountPercent, setDiscountPercent] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);

  // Pricing selection state
  const [selectedDomains, setSelectedDomains] = useState<Record<ServiceKey, string>>({
    landing: 'sub',
    multi: 'none',
    port: 'none',
  });

  // Order form state
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    service: initialService,
    domain: initialDomain,
    business: '',
    deadline: '',
    message: '',
    referral: '',
  });
  const [orderError, setOrderError] = useState('');

  // Synchronize initial props
  useEffect(() => {
    if (initialService) {
      setOrderForm((prev) => ({
        ...prev,
        service: initialService,
        domain: initialDomain || Object.keys(CONFIG.services[initialService].options)[0],
      }));
    }
  }, [initialService, initialDomain]);

  // Check URL query parameters for referral
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('r');
    if (ref) {
      setOrderForm((prev) => ({ ...prev, referral: ref }));
    }
  }, []);

  // Smooth counter animation from 0 up to 73
  useEffect(() => {
    let v = 0;
    const target = 73;
    const interval = setInterval(() => {
      v += 2;
      if (v >= target) {
        v = target;
        clearInterval(interval);
      }
      setDiscountPercent(v);
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const handleDomainSelect = (serviceKey: ServiceKey, domainKey: string) => {
    setSelectedDomains((prev) => ({ ...prev, [serviceKey]: domainKey }));
  };

  const handleOrderThis = (serviceKey: ServiceKey) => {
    const currentDomain = selectedDomains[serviceKey];
    setOrderForm((prev) => ({
      ...prev,
      service: serviceKey,
      domain: currentDomain,
    }));
    const orderElem = document.getElementById('orderf');
    if (orderElem) {
      orderElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getOrderEstimate = () => {
    const s = CONFIG.services[orderForm.service];
    if (!s) return { usd: '$15', full: '₦20,000' };

    let nairaValue: number;
    const isNotSure = orderForm.domain === 'x';

    if (isNotSure) {
      const firstOpt = Object.values(s.options)[0];
      nairaValue = firstOpt.naira;
    } else {
      const opt = s.options[orderForm.domain];
      nairaValue = opt ? opt.naira : Object.values(s.options)[0].naira;
    }

    return {
      usd: formatUSD(nairaValue) + (isNotSure ? ' and up' : ''),
      full: formatFullFx(nairaValue),
    };
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = orderForm.phone.replace(/\D/g, '');
    if (orderForm.name.trim().length < 2 || cleanPhone.length < 10) {
      setOrderError('Enter your name and a valid WhatsApp number.');
      return;
    }
    setOrderError('');

    const serviceName = CONFIG.services[orderForm.service].name;
    const domainLabel =
      orderForm.domain === 'x'
        ? 'Not sure yet'
        : CONFIG.services[orderForm.service].options[orderForm.domain]?.label || orderForm.domain;
    const est = getOrderEstimate();

    const lines = [
      'New order: Upskilltown Agency',
      `Name: ${orderForm.name.trim()}`,
      `WhatsApp: ${orderForm.phone.trim()}`,
      `Service: ${serviceName}`,
      `Domain: ${domainLabel}`,
      `Estimate: ${est.usd} (${est.full})`,
      `Business: ${orderForm.business.trim() || 'Not specified'}`,
      `Deadline: ${orderForm.deadline.trim() || 'Standard'}`,
      `Details: ${orderForm.message.trim() || 'None provided'}`,
    ];

    if (orderForm.referral.trim()) {
      lines.push(`Referred by: ${orderForm.referral.trim()}`);
    }

    const message = lines.join('\n');
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const currentServiceObj = CONFIG.services[orderForm.service];
  const orderEstimate = getOrderEstimate();

  const marqueeItems = [
    'Landing pages',
    'Multi-page websites',
    'Portfolio websites',
    'Built to get clients',
  ];

  return (
    <div className="w-container pb-20">
      {/* Hero Section */}
      <div className="hero">
        <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Websites and landing pages for businesses
        </span>

        {/* Animated staggered headline lines */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold tracking-[-0.045em] leading-[0.98]">
          <span className="ln" style={{ '--i': 0 } as React.CSSProperties}>
            <span>We build websites</span>
          </span>
          <span className="ln" style={{ '--i': 1 } as React.CSSProperties}>
            <span>that make your brand</span>
          </span>
          <span className="ln" style={{ '--i': 2 } as React.CSSProperties}>
            <span style={{ color: 'var(--mut)' }}>look expensive.</span>
          </span>
        </h1>

        <p className="max-w-[560px] text-base sm:text-lg md:text-[19px] text-[var(--mut)] my-7 leading-relaxed">
          Landing pages, multi-page websites and portfolios that bring you clients. Pick a plan, tell us about your business, and we’ll finish the chat on WhatsApp.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const el = document.getElementById('orderf');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="agency-btn p text-sm"
          >
            Start your project
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('pricing');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="agency-btn text-sm"
          >
            View pricing
          </button>
        </div>

        {/* Floating Glass Counter Badge with fl animation */}
        <div ref={countRef} className="glass">
          <b className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-[#ff4800] leading-none block">
            {discountPercent}%
          </b>
          <span className="text-xs sm:text-sm text-[var(--mut)] font-medium mt-1 block">
            off today on landing pages
          </span>
        </div>
      </div>

      {/* Infinite Marquee Banner */}
      <div className="mq" aria-hidden="true">
        <div>
          {/* Segment 1 */}
          {marqueeItems.map((text, idx) => (
            <span key={`mq-1-${idx}`}>{text}</span>
          ))}
          {/* Segment 2 for seamless loop */}
          {marqueeItems.map((text, idx) => (
            <span key={`mq-2-${idx}`}>{text}</span>
          ))}
        </div>
      </div>

      {/* Pills Banner */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 my-12">
        <div
          className="rounded-full py-4 sm:py-7 md:py-9 text-center font-bold text-base sm:text-2xl md:text-3xl border transition-all"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--line)',
            color: 'var(--fg)',
          }}
        >
          We
        </div>
        <div className="rounded-full py-4 sm:py-7 md:py-9 text-center font-bold text-base sm:text-2xl md:text-3xl text-white bg-gradient-to-br from-[#e8853d] to-[#d1330a] shadow-sm">
          Create
        </div>
        <div className="rounded-full py-4 sm:py-7 md:py-9 text-center font-bold text-base sm:text-2xl md:text-3xl text-white bg-black dark:bg-zinc-900 border border-black dark:border-zinc-800">
          →
        </div>
        <div
          className="rounded-full py-4 sm:py-7 md:py-9 text-center font-bold text-base sm:text-2xl md:text-3xl border transition-all"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--line)',
            color: 'var(--mut)',
          }}
        >
          Future
        </div>
      </div>

      {/* What We Build Section with .rv reveal classes */}
      <div className="py-12 md:py-16">
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          What we build
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="agency-card rv">
            <span className="text-4xl mb-14 block">⚡</span>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Landing pages</h3>
            <p className="text-[var(--mut)] mt-3 leading-relaxed">
              One focused page, built to turn visitors into customers.
            </p>
          </div>

          <div className="agency-card rv">
            <span className="text-4xl mb-14 block">🗂️</span>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Multi-page websites</h3>
            <p className="text-[var(--mut)] mt-3 leading-relaxed">
              A full business website with every page your brand needs.
            </p>
          </div>

          <div className="agency-card rv">
            <span className="text-4xl mb-14 block">🎨</span>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Portfolio websites</h3>
            <p className="text-[var(--mut)] mt-3 leading-relaxed">
              Show your work and get hired, on a site that looks the part.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section with .rv reveal */}
      <div id="pricing" className="py-12 md:py-16">
        <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Pricing in naira
        </span>
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          Limited offer prices
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {(Object.entries(CONFIG.services) as [ServiceKey, typeof CONFIG.services[ServiceKey]][]).map(([key, svc]) => {
            const currentSelectedDomain = selectedDomains[key];
            const currentOption = svc.options[currentSelectedDomain] || Object.values(svc.options)[0];

            return (
              <div
                key={key}
                className="agency-card rv flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[var(--fg)]">{svc.name}</h3>
                  <div className="my-5">
                    <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#ff4800] leading-none">
                      {formatUSD(currentOption.naira)}
                    </div>
                    <small className="block text-xs font-semibold tracking-normal text-[var(--mut)] mt-2">
                      {formatFullFx(currentOption.naira)}
                    </small>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="line-through text-base text-[var(--mut)]">
                      {formatUSD(svc.wasNaira)}
                    </span>
                    <span className="bg-[#ff4800] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                      Limited offer
                    </span>
                  </div>

                  {/* Domain Selector Options */}
                  <div className="flex flex-wrap gap-2 my-5">
                    {Object.entries(svc.options).map(([optKey, optVal]) => {
                      const isSelected = optKey === currentSelectedDomain;
                      return (
                        <button
                          key={optKey}
                          onClick={() => handleDomainSelect(key, optKey)}
                          className={`min-h-[40px] px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-sm'
                              : 'bg-transparent text-[var(--fg)] hover:border-[var(--fg)]'
                          }`}
                          style={{ borderColor: isSelected ? 'var(--fg)' : 'var(--line)' }}
                        >
                          {optVal.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleOrderThis(key)}
                  className="agency-btn p w-full mt-4 text-sm"
                >
                  Order this
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[var(--mut)] mt-4">
          Dollar, shilling and cedi amounts are approximate, based on mid-2026 exchange rates. Naira prices are exact, and final amounts are confirmed on WhatsApp.
        </p>
      </div>

      {/* How Booking Works Section with animated track, dot and pulsing icons */}
      <div className="py-12 md:py-16">
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          How booking works
        </h2>

        <div className="steps rv">
          {/* Animated dashed track with traveling glow dot */}
          <div className="trk" />

          {[
            { icon: '📝', title: 'Fill the form', desc: 'Tell us what you need' },
            { icon: '💬', title: 'Chat on WhatsApp', desc: 'We confirm the details' },
            { icon: '🛠️', title: 'We build', desc: 'Your site takes shape' },
            { icon: '🚀', title: 'Go live', desc: 'Launch and share it' },
          ].map((step, idx) => (
            <div key={idx} className="st" style={{ '--i': idx } as React.CSSProperties}>
              <div className="ic">{step.icon}</div>
              <b>{step.title}</b>
              <small>{step.desc}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Start Your Project Order Form */}
      <div id="orderf" className="py-12 md:py-16">
        <div className="agency-card">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Start your project</h2>
          <p className="text-[var(--mut)] text-sm sm:text-base mt-2">
            Fill this in and we’ll open WhatsApp with your details ready to send.
          </p>

          <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Your name <span className="text-[#ff4800]">*</span></span>
              <input
                type="text"
                value={orderForm.name}
                onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                placeholder="e.g. David Adeleke"
                autoComplete="name"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>WhatsApp number <span className="text-[#ff4800]">*</span></span>
              <input
                type="tel"
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                placeholder="e.g. 08012345678"
                autoComplete="tel"
                inputMode="tel"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Service</span>
              <select
                value={orderForm.service}
                onChange={(e) => {
                  const newService = e.target.value as ServiceKey;
                  const firstDomain = Object.keys(CONFIG.services[newService].options)[0];
                  setOrderForm({ ...orderForm, service: newService, domain: firstDomain });
                }}
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800] cursor-pointer"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              >
                {Object.entries(CONFIG.services).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Domain</span>
              <select
                value={orderForm.domain}
                onChange={(e) => setOrderForm({ ...orderForm, domain: e.target.value })}
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800] cursor-pointer"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              >
                {Object.entries(currentServiceObj.options).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
                <option value="x">Not sure yet</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Business name</span>
              <input
                type="text"
                value={orderForm.business}
                onChange={(e) => setOrderForm({ ...orderForm, business: e.target.value })}
                placeholder="e.g. Apex Studio"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Deadline</span>
              <input
                type="text"
                value={orderForm.deadline}
                onChange={(e) => setOrderForm({ ...orderForm, deadline: e.target.value })}
                placeholder="e.g. 1 week"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
              <span>Tell us about your business</span>
              <textarea
                value={orderForm.message}
                onChange={(e) => setOrderForm({ ...orderForm, message: e.target.value })}
                placeholder="What is your business about, what products/services do you offer, and what is your primary goal for this site?"
                className="w-full min-h-[100px] p-4 rounded-2xl border text-sm focus:border-[#ff4800] resize-y"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
              <span>Referred by an affiliate? (optional)</span>
              <input
                type="text"
                value={orderForm.referral}
                onChange={(e) => setOrderForm({ ...orderForm, referral: e.target.value })}
                placeholder="Affiliate’s name or code (e.g. UPT-2491)"
                className="w-full min-h-[48px] px-4 rounded-2xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            {/* Estimated Price Box */}
            <div
              className="md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-[#ff4800]"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <div className="font-bold text-base text-[var(--fg)]">
                Estimated price
                <span className="block text-xs font-normal text-[var(--mut)]">
                  Confirmed upfront on WhatsApp before any payment
                </span>
              </div>
              <div className="mt-2 sm:mt-0 text-left sm:text-right">
                <b className="text-2xl sm:text-3xl font-extrabold text-[#ff4800] tracking-tight block">
                  {orderEstimate.usd}
                </b>
                <small className="text-xs font-semibold text-[var(--mut)]">
                  {orderEstimate.full}
                </small>
              </div>
            </div>

            {orderError && (
              <div className="md:col-span-2 text-red-500 font-semibold text-sm">
                {orderError}
              </div>
            )}

            <button
              type="submit"
              className="agency-btn p md:col-span-2 min-h-[48px] text-base"
            >
              Send on WhatsApp
            </button>
          </form>
        </div>
      </div>

      {/* Client Feedback Testimonials with .rv reveal */}
      <div id="tm" className="py-12 md:py-16">
        <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Client feedback
        </span>
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          Don’t just take our word for it.
        </h2>
        <p className="text-[var(--mut)] max-w-lg mt-3 text-base">
          Real feedback from clients we’ve built for, with proof you can open.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="agency-card rv flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#ff4800] tracking-widest text-base">
                    {'★'.repeat(t.rating)}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full border text-xs font-semibold"
                    style={{ borderColor: 'var(--line)', backgroundColor: 'var(--bg)' }}
                  >
                    {t.source}
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-[var(--fg)] mb-2">
                  “{t.quoteTitle}”
                </h3>
                <p className="text-sm text-[var(--mut)] leading-relaxed">
                  {t.fullQuote}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--line)' }}>
                  <div className="w-10 h-10 rounded-full bg-[#ff4800] text-white font-bold flex items-center justify-center shrink-0">
                    {t.avatarLetter}
                  </div>
                  <div className="leading-tight">
                    <b className="text-sm font-bold text-[var(--fg)]">{t.clientName}</b>
                    <br />
                    <small className="text-xs text-[var(--mut)]">{t.serviceOrdered}</small>
                  </div>
                </div>

                <button
                  onClick={() => onOpenProofModal(t)}
                  className="agency-btn w-full mt-4 min-h-[38px] text-xs"
                >
                  View proof
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Section with .rv reveal */}
      <div className="py-12 md:py-16">
        <h2 className="rv text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          Questions
        </h2>

        <div className="mt-6 border-t" style={{ borderColor: 'var(--line)' }}>
          {[
            {
              q: 'How do I order?',
              a: 'Fill in the form above and tap Send. WhatsApp opens with your details, and we reply there with full confirmation and answers to any questions you have.',
            },
            {
              q: 'What is a subdomain-only site?',
              a: 'Your site goes live on a free address such as yourname.vercel.app instead of your own .com, .net or .online domain. It costs less and is great for launching quickly.',
            },
            {
              q: 'Can I add my own domain later?',
              a: 'Yes! If you start with a subdomain, message us on WhatsApp anytime later and we will connect your custom domain seamlessly.',
            },
            {
              q: 'How fast is project delivery?',
              a: 'Single landing pages typically deliver in 2-4 business days. Multi-page websites take around 5-7 business days depending on content scope.',
            },
            {
              q: 'Do you help write the content and copy?',
              a: 'Yes. Just tell us what your business does and who you serve. We will draft clean, persuasive headlines and descriptions structured to convert visitors into clients.',
            },
          ].map((faq, index) => (
            <details
              key={index}
              className="border-b py-5 group cursor-pointer"
              style={{ borderColor: 'var(--line)' }}
            >
              <summary className="font-bold text-lg sm:text-xl tracking-tight list-none flex justify-between items-center select-none">
                <span>{faq.q}</span>
                <span className="text-2xl text-[#ff4800] transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-[var(--mut)] text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
