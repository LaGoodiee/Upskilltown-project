import React from 'react';
import { getWhatsAppUrl } from '../data';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <a
      href={getWhatsAppUrl('Hello Upskilltown Agency, I’d like to order a website.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-btn"
      title="Chat on WhatsApp: 07068276281"
    >
      💬
    </a>
  );
};
