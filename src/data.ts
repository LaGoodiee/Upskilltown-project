import { ServiceConfig, ServiceKey, ProjectItem, TestimonialItem } from './types';

export const CONFIG = {
  adminEmail: 'goodnessndukauba@gmail.com',
  wa: '2347068276281',
  prefix: 'UPT',
  fx: {
    usd: 1365,
    kes: 0.0948,
    ghs: 0.0083,
  },
  services: {
    landing: {
      name: 'Landing Page',
      wasNaira: 75000,
      options: {
        sub: { label: 'Subdomain only', naira: 20000 },
        com: { label: '.com', naira: 45000 },
        net: { label: '.net', naira: 45000 },
        online: { label: '.online', naira: 35000 },
      },
    },
    multi: {
      name: 'Multi-Page Website',
      wasNaira: 160000,
      options: {
        none: { label: 'Subdomain only', naira: 50000 },
        com: { label: '.com', naira: 67000 },
        net: { label: '.net', naira: 67000 },
        online: { label: '.online', naira: 55000 },
      },
    },
    port: {
      name: 'Portfolio Website',
      wasNaira: 40000,
      options: {
        none: { label: 'Subdomain only', naira: 20000 },
        online: { label: '.online', naira: 25000 },
        com: { label: '.com', naira: 35000 },
        net: { label: '.net', naira: 35000 },
      },
    },
  } as Record<ServiceKey, ServiceConfig>,
  team: {
    min: 150,
    deadline: '31 December 2026',
    tiers: [
      { min: 150, max: 299, percent: 20, label: '150 to 299 clients' },
      { min: 300, max: null, percent: 25, label: '300+ clients' },
    ],
  },
  pay: [
    { service: 'Multi-Page Website', perClient: 10000, maxMonthly: 300000 },
    { service: 'Landing Page', perClient: 5000, maxMonthly: 150000 },
    { service: 'Portfolio Website', perClient: 3000, maxMonthly: 90000 },
  ],
};

// Formatting helpers
export const formatNaira = (n: number) => `₦${n.toLocaleString('en-US')}`;

export const formatUSD = (n: number) => `$${Math.round(n / CONFIG.fx.usd).toLocaleString('en-US')}`;

export const formatFullFx = (naira: number) => {
  const kes = Math.round(naira * CONFIG.fx.kes).toLocaleString('en-US');
  const ghs = Math.round(naira * CONFIG.fx.ghs).toLocaleString('en-US');
  return `₦${naira.toLocaleString('en-US')} · KSh ${kes} · GH₵ ${ghs}`;
};

export const getWhatsAppUrl = (text?: string) => {
  const base = `https://wa.me/${CONFIG.wa}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};

// Testimonials data (realistic agency feedback + proofs)
export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'tm-1',
    source: 'WhatsApp',
    quoteTitle: 'Conversion rate doubled in 2 weeks',
    fullQuote:
      'Goodness and the Upskilltown team delivered our fintech sales page within 4 days. The design looks world-class, loaded instantly, and our signup conversions increased by 140%.',
    clientName: 'Tunde Adeyemi',
    serviceOrdered: 'Fintech Landing Page (.com)',
    verified: true,
    avatarLetter: 'T',
    rating: 5,
    date: 'October 2026',
    proofScreenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tm-2',
    source: 'WhatsApp',
    quoteTitle: 'Clients thought we paid $2,000 for this site',
    fullQuote:
      'We wanted our architectural studio brand to look super expensive without breaking our seed budget. Upskilltown gave us exactly that. Clean lines, fluid transitions, and super crisp typography.',
    clientName: 'Chioma Nwosu',
    serviceOrdered: 'Multi-Page Website (.online)',
    verified: true,
    avatarLetter: 'C',
    rating: 5,
    date: 'September 2026',
    proofScreenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tm-3',
    source: 'WhatsApp',
    quoteTitle: 'Got 3 freelance offers in my first month',
    fullQuote:
      'My design portfolio was built by Upskilltown Agency on a custom subdomain. It looks so sleek on mobile. Highly recommended if you want clients to take your work seriously.',
    clientName: 'Kofi Mensah',
    serviceOrdered: 'Portfolio Website (Subdomain)',
    verified: true,
    avatarLetter: 'K',
    rating: 5,
    date: 'August 2026',
    proofScreenshot: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  },
];

// Sample featured showcase projects for "Proof of work"
export const PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'AuraPay Global Payments',
    category: 'landing',
    categoryLabel: 'Landing pages',
    description: 'High-converting financial technology landing page with interactive fee calculator and instant wallet onboarding flow.',
    url: 'https://wa.me/2347068276281?text=Hello%20Upskilltown,%20I%20saw%20the%20AuraPay%20project%20and%20want%20a%20similar%20site.',
    client: 'AuraPay Ltd',
    metrics: '3.4x conversions',
    previewImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'proj-2',
    title: 'Vertex Logistics & Freight',
    category: 'multi',
    categoryLabel: 'Multi-page',
    description: 'Corporate 6-page digital presence for an international haulage and cargo broker with shipment tracking integration.',
    url: 'https://wa.me/2347068276281?text=Hello%20Upskilltown,%20I%20want%20a%20multi-page%20business%20website%20like%20Vertex.',
    client: 'Vertex Haulage',
    metrics: '6 pages built in 7 days',
    previewImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'proj-3',
    title: 'Elena Vance Architecture',
    category: 'port',
    categoryLabel: 'Portfolio',
    description: 'Minimalist editorial showcase website for an interior architect featuring high-resolution project galleries and client inquiry flows.',
    url: 'https://wa.me/2347068276281?text=Hello%20Upskilltown,%20I%20want%20a%20portfolio%20website%20like%20Elena%20Vance.',
    client: 'Elena Vance Studio',
    metrics: '99/100 Mobile Speed',
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'proj-4',
    title: 'Solstice Solar Energy',
    category: 'landing',
    categoryLabel: 'Landing pages',
    description: 'Lead generation landing page for residential and commercial rooftop solar installation with WhatsApp quote routing.',
    url: 'https://wa.me/2347068276281?text=Hello%20Upskilltown,%20I%20want%20a%20lead-gen%20page%20like%20Solstice.',
    client: 'Solstice Systems',
    metrics: '+45% qualified leads',
    previewImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'proj-5',
    title: 'Haven Luxury Real Estate',
    category: 'multi',
    categoryLabel: 'Multi-page',
    description: 'Multi-page property catalog and private viewing reservation platform for luxury apartments and duplex developments.',
    url: 'https://wa.me/2347068276281?text=Hello%20Upskilltown,%20I%20want%20a%20real%20estate%20website%20like%20Haven.',
    client: 'Haven Properties',
    metrics: 'Full CMS Integration',
    previewImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'proj-6',
    title: 'Tariq S. Product Design',
    category: 'port',
    categoryLabel: 'Portfolio',
    description: 'Interactive case studies portfolio with interactive Figma prototypes, design philosophy, and direct booking links.',
    url: 'https://wa.me/2347068276281?text=Hello%20Upskilltown,%20I%20want%20a%20designer%20portfolio%20like%20Tariq.',
    client: 'Tariq S. (Senior UX)',
    metrics: 'Top 3% Portfolio Award',
    previewImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
  },
];
