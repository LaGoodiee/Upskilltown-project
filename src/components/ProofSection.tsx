import React, { useState } from 'react';
import { PROJECTS, getWhatsAppUrl } from '../data';
import { ProjectItem } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const ProofSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'landing' | 'multi' | 'port'>('all');

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'landing', label: 'Landing pages' },
    { key: 'multi', label: 'Multi-page' },
    { key: 'port', label: 'Portfolio' },
  ] as const;

  const filteredProjects = PROJECTS.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  // Trigger scroll reveal on category filter change
  useScrollReveal(activeCategory);

  return (
    <div className="w-container pb-20">
      {/* Hero Section with staggered line reveals */}
      <div className="hero">
        <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Proof of work
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold tracking-[-0.045em] leading-[0.98]">
          <span className="ln" style={{ '--i': 0 } as React.CSSProperties}>
            <span>Sites we’ve</span>
          </span>
          <span className="ln" style={{ '--i': 1 } as React.CSSProperties}>
            <span style={{ color: 'var(--mut)' }}>shipped.</span>
          </span>
        </h1>

        <p className="max-w-[560px] text-base sm:text-lg md:text-[19px] text-[var(--mut)] my-7 leading-relaxed">
          Real projects will appear here soon.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 my-8">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`agency-btn text-sm ${isActive ? 'k' : ''}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Projects Grid with .rv scroll reveal */}
      {filteredProjects.length === 0 ? (
        <div className="agency-card text-center py-16 text-[var(--mut)]">
          <span className="text-4xl block mb-2">📂</span>
          <p className="font-semibold text-lg text-[var(--fg)]">No projects in this category yet</p>
          <p className="text-sm mt-1">We are currently delivering our first client projects in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: ProjectItem) => (
            <div
              key={project.id}
              className="agency-card rv flex flex-col justify-between"
            >
              <div>
                {/* Visual preview box with smooth gradient */}
                <div
                  className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-5 border relative group"
                  style={{
                    borderColor: 'var(--line)',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--o) 30%, var(--card)), var(--card))',
                  }}
                >
                  {project.previewImage ? (
                    <img
                      src={project.previewImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🖼️
                    </div>
                  )}
                  {project.metrics && (
                    <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {project.metrics}
                    </span>
                  )}
                </div>

                <span
                  className="inline-block px-3 py-1 rounded-full border text-xs font-semibold mb-2.5"
                  style={{ borderColor: 'var(--line)', backgroundColor: 'var(--bg)' }}
                >
                  {project.categoryLabel}
                </span>

                <h3 className="text-xl font-bold tracking-tight text-[var(--fg)]">
                  {project.title}
                </h3>

                <p className="text-sm text-[var(--mut)] mt-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agency-btn text-xs w-full justify-center"
                  >
                    Visit site
                  </a>
                ) : (
                  <button
                    disabled
                    className="agency-btn text-xs w-full justify-center"
                  >
                    Coming soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Want Yours Here CTA */}
      <div className="py-16 text-center mt-12 rounded-[32px] border p-8 sm:p-12 agency-card rv">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Want yours here?
        </h2>
        <div className="flex justify-center mt-6">
          <a
            href={getWhatsAppUrl('Hello Upskilltown Agency, I’d like to order a website.')}
            target="_blank"
            rel="noopener noreferrer"
            className="agency-btn p text-base"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
