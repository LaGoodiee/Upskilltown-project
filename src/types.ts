export type AppRoute =
  | 'offer'
  | 'affiliates'
  | 'proof'
  | 'login'
  | 'dashboard'
  | 'team'
  | 'admin';

export type ServiceKey = 'landing' | 'multi' | 'port';

export type DomainOption = {
  label: string;
  naira: number;
};

export interface ServiceConfig {
  name: string;
  wasNaira: number;
  options: Record<string, DomainOption>;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'landing' | 'multi' | 'port';
  categoryLabel: string;
  description: string;
  url?: string;
  previewImage?: string;
  client?: string;
  metrics?: string;
}

export interface TestimonialItem {
  id: string;
  source: string;
  quoteTitle: string;
  fullQuote: string;
  clientName: string;
  serviceOrdered: string;
  verified: boolean;
  avatarLetter: string;
  rating: number;
  proofScreenshot?: string;
  date?: string;
}
