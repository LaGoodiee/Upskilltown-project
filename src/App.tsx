/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ProofModal } from './components/ProofModal';
import { HomeSection } from './components/HomeSection';
import { AffiliatesSection } from './components/AffiliatesSection';
import { ProofSection } from './components/ProofSection';
import { DashboardPage } from './components/DashboardPage';
import { AdminPage } from './components/AdminPage';
import { LoginPage } from './components/LoginPage';
import { TeamPortalPage } from './components/TeamPortalPage';
import { AppProvider } from './context/AppContext';
import { TestimonialItem, AppRoute } from './types';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('th');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  // Tab routing state based on URL hash
  const [currentTab, setCurrentTab] = useState<AppRoute>('offer');

  // Modal state
  const [activeTestimonial, setActiveTestimonial] = useState<TestimonialItem | null>(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('th', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync hash with currentTab supporting #offer, #affiliates, #proof, #login, #dashboard, #team, #admin
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      const validRoutes: AppRoute[] = [
        'offer',
        'affiliates',
        'proof',
        'login',
        'dashboard',
        'team',
        'admin',
      ];

      if (validRoutes.includes(hash)) {
        setCurrentTab(hash);
      } else if (!hash) {
        setCurrentTab('offer');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navigateToHome = () => {
    window.location.hash = 'offer';
    setCurrentTab('offer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col transition-colors selection:bg-[#ff4800] selection:text-white">
        {/* Navigation Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content Sections */}
        <main className="flex-1">
          {currentTab === 'offer' && (
            <HomeSection
              onOpenProofModal={(testimonial) => setActiveTestimonial(testimonial)}
            />
          )}

          {currentTab === 'affiliates' && <AffiliatesSection />}

          {currentTab === 'proof' && <ProofSection />}

          {currentTab === 'login' && <LoginPage />}

          {currentTab === 'dashboard' && <DashboardPage />}

          {currentTab === 'team' && <TeamPortalPage />}

          {currentTab === 'admin' && <AdminPage />}
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Action WhatsApp Button */}
        <FloatingWhatsApp />

        {/* Proof Lightbox Modal */}
        <ProofModal
          isOpen={Boolean(activeTestimonial)}
          imageUrl={activeTestimonial?.proofScreenshot}
          title={activeTestimonial?.quoteTitle}
          client={activeTestimonial?.clientName}
          onClose={() => setActiveTestimonial(null)}
        />
      </div>
    </AppProvider>
  );
}
