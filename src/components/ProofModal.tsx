import React, { useEffect } from 'react';

interface ProofModalProps {
  isOpen: boolean;
  imageUrl?: string;
  title?: string;
  client?: string;
  onClose: () => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  isOpen,
  imageUrl,
  title,
  client,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Client proof showcase"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative max-w-2xl w-full rounded-3xl overflow-hidden border p-5 shadow-2xl"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--line)',
        }}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-500">
                Verified Client WhatsApp Feedback
              </span>
            </div>
            {client && <h3 className="font-bold text-lg text-[var(--fg)] mt-1">{client}</h3>}
            {title && <p className="text-xs text-[var(--mut)]">{title}</p>}
          </div>

          <button
            onClick={onClose}
            aria-label="Close proof preview"
            className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-lg transition-transform hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--line)',
              color: 'var(--fg)',
            }}
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border bg-zinc-950/20 max-h-[70vh] flex items-center justify-center" style={{ borderColor: 'var(--line)' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Screenshot proof of the testimonial"
              className="w-full h-auto max-h-[65vh] object-cover rounded-xl"
            />
          ) : (
            <div className="p-12 text-center text-[var(--mut)]">
              <span className="text-4xl block mb-2">📸</span>
              <p className="font-semibold">Screenshot proof file</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--mut)]" style={{ borderColor: 'var(--line)' }}>
          <span>Upskilltown Agency · Authentic Client Communication</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full font-bold border hover:bg-[var(--bg)] cursor-pointer"
            style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
