import React, { useState, useEffect } from 'react';
import { CONFIG, getWhatsAppUrl } from '../data';
import {
  fetchTopLeaderboard,
  updateTopLeaderboard,
  fetchPartnerApplications,
  updatePartnerApplicationStatus,
  LeaderboardEntry,
  PartnerApplication,
  isFirebaseConfigured,
} from '../firebase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAppContext } from '../context/AppContext';
import { FirebaseStatusBanner } from './FirebaseStatusBanner';

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Chukwuma Obi (Sample)', paidCount: 19 },
  { name: 'Amina Bello (Sample)', paidCount: 14 },
  { name: 'David Adeleke (Sample)', paidCount: 11 },
  { name: 'Blessing Eze (Sample)', paidCount: 8 },
  { name: 'Tunde Bakare (Sample)', paidCount: 6 },
  { name: 'Ngozi Okafor (Sample)', paidCount: 4 },
];

const SAMPLE_APPLICATIONS: PartnerApplication[] = [
  {
    id: 'sample_app_1',
    type: 'individual_affiliate',
    applicantName: 'Chinedu Eze (Sample)',
    phone: '+234 803 123 4567',
    platform: 'Instagram / WhatsApp Status',
    reach: '4,500 active SME followers',
    pitch: 'I specialize in helping local retailers establish digital web presence.',
    status: 'pending',
    appliedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    generatedCode: 'UP-7821',
  },
  {
    id: 'sample_app_2',
    type: 'sales_team',
    applicantName: 'Apex Sales Collective (Sample)',
    teamName: 'Apex Sales Collective',
    leadName: 'Fatima Garba',
    phone: '+234 812 987 6543',
    teamSize: '8 associates',
    targetRange: '300 to 499 clients',
    pitch: 'We do direct outreach to registered businesses in Abuja and Lagos.',
    status: 'pending',
    appliedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export const AdminPage: React.FC = () => {
  useScrollReveal();
  const { isPreviewMode } = useAppContext();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Applications state
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form for marking a client as paid
  const [affiliateName, setAffiliateName] = useState('');
  const [clientCountDelta, setClientCountDelta] = useState(1);

  // Load current leaderboard and applications on mount or when preview toggled
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setAppsLoading(true);

      const [leaderboardRes, appsRes] = await Promise.all([
        fetchTopLeaderboard(),
        fetchPartnerApplications(),
      ]);

      if (isMounted) {
        if (!isFirebaseConfigured && isPreviewMode) {
          setEntries(SAMPLE_LEADERBOARD);
          setApplications(SAMPLE_APPLICATIONS);
        } else {
          setEntries(
            leaderboardRes.entries && leaderboardRes.entries.length > 0
              ? leaderboardRes.entries
              : (isPreviewMode ? SAMPLE_LEADERBOARD : [])
          );
          setApplications(
            appsRes.applications && appsRes.applications.length > 0
              ? appsRes.applications
              : (isPreviewMode ? SAMPLE_APPLICATIONS : [])
          );
        }
        setLoading(false);
        setAppsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isPreviewMode]);

  const handleUpdateAppStatus = async (appId: string, status: 'pending' | 'approved' | 'rejected') => {
    setActionLoadingId(appId);
    const res = await updatePartnerApplicationStatus(appId, status);
    if (res.success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
      setFeedback({
        type: 'success',
        message: `Application marked as ${status}. Updated in Firestore!`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update application.',
      });
    }
    setActionLoadingId(null);
  };

  // Mark client as paid browser-side and update leaderboard/top
  const handleMarkAsPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = affiliateName.trim();
    if (cleanName.length < 2) {
      setFeedback({ type: 'error', message: 'Please enter a valid affiliate name.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    // Clone current entries
    let updated = [...entries];
    const existingIndex = updated.findIndex(
      (e) => e.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        paidCount: updated[existingIndex].paidCount + clientCountDelta,
      };
    } else {
      updated.push({
        name: cleanName,
        paidCount: clientCountDelta,
      });
    }

    // Sort descending and keep top 10
    updated.sort((a, b) => b.paidCount - a.paidCount);
    updated = updated.slice(0, 10);

    const res = await updateTopLeaderboard(updated, CONFIG.adminEmail);

    if (res.success) {
      setEntries(updated);
      setAffiliateName('');
      setClientCountDelta(1);
      setFeedback({
        type: 'success',
        message: `Successfully marked client as paid for ${cleanName}. Document "leaderboard/top" updated in browser!`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update leaderboard in Firestore.',
      });
    }
    setSaving(false);
  };

  // Quick increment for an existing affiliate
  const handleQuickIncrement = async (index: number) => {
    setSaving(true);
    setFeedback(null);

    let updated = [...entries];
    updated[index] = {
      ...updated[index],
      paidCount: updated[index].paidCount + 1,
    };

    updated.sort((a, b) => b.paidCount - a.paidCount);
    updated = updated.slice(0, 10);

    const res = await updateTopLeaderboard(updated, CONFIG.adminEmail);

    if (res.success) {
      setEntries(updated);
      setFeedback({
        type: 'success',
        message: `+1 paid client added for ${updated[index]?.name || 'affiliate'}. Leaderboard updated!`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update leaderboard.',
      });
    }
    setSaving(false);
  };

  // Remove an entry
  const handleRemoveEntry = async (index: number) => {
    setSaving(true);
    setFeedback(null);

    const updated = entries.filter((_, i) => i !== index);
    const res = await updateTopLeaderboard(updated, CONFIG.adminEmail);

    if (res.success) {
      setEntries(updated);
      setFeedback({
        type: 'success',
        message: 'Affiliate removed from top 10 standings.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update leaderboard.',
      });
    }
    setSaving(false);
  };

  return (
    <div className="w-container pb-20">
      {/* Backend connection warning & preview mode banner */}
      <div className="pt-6">
        <FirebaseStatusBanner />
      </div>

      {/* Header */}
      <div className="pt-8 md:pt-12 pb-6">
        <div className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-4 bg-[var(--card)]"
          style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
          Admin Panel · Browser-Side Firestore Controls
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.045em] leading-[0.98]">
          <span className="ln" style={{ '--i': 0 } as React.CSSProperties}>
            <span>Manage Paid Clients &</span>
          </span>
          <span className="ln" style={{ '--i': 1 } as React.CSSProperties}>
            <span style={{ color: 'var(--mut)' }}>Leaderboard.</span>
          </span>
        </h1>

        <p className="max-w-[580px] text-base sm:text-lg text-[var(--mut)] my-6 leading-relaxed">
          Authorized Admin: <strong className="text-[var(--fg)]">{CONFIG.adminEmail}</strong>.
          Updates the single summary document <code className="px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--line)]">leaderboard/top</code> directly from the browser with no Cloud Functions needed.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#dashboard"
            className="agency-btn p text-sm"
          >
            View Live Dashboard →
          </a>
          <a
            href="#affiliates"
            className="agency-btn text-sm"
          >
            Affiliates Page
          </a>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
              : 'bg-red-500/10 text-red-600 border-red-500/30'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs px-2 py-1 rounded hover:bg-black/10 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Mark Client as Paid Form */}
        <div className="agency-card rv in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💳</span>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
              Mark Client Paid
            </h2>
          </div>
          <p className="text-xs text-[var(--mut)] mb-6 leading-relaxed">
            When an affiliate’s client completes payment, record it here to top up their standing on the leaderboard.
          </p>

          <form onSubmit={handleMarkAsPaid} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-semibold">
              <span>Affiliate Name <span className="text-[#ff4800]">*</span></span>
              <input
                type="text"
                value={affiliateName}
                onChange={(e) => setAffiliateName(e.target.value)}
                placeholder="e.g. Emeka Okafor"
                className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold">
              <span>Paid Clients to Add</span>
              <input
                type="number"
                min="1"
                max="50"
                value={clientCountDelta}
                onChange={(e) => setClientCountDelta(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
              />
            </label>

            <div className="text-[11px] text-[var(--mut)] leading-normal mt-1">
              🔒 Privacy Guaranteed: Stores only the affiliate name and count in <code className="text-[#ff4800]">leaderboard/top</code>. Phone numbers are never stored.
            </div>

            <button
              type="submit"
              disabled={saving || !affiliateName.trim()}
              className="agency-btn p w-full min-h-[44px] text-sm mt-2 disabled:opacity-50"
            >
              {saving ? 'Updating Firestore...' : 'Mark as Paid & Update'}
            </button>
          </form>
        </div>

        {/* Current Top 10 Leaderboard Document Preview & Quick Editor */}
        <div className="agency-card lg:col-span-2 rv in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b gap-2" style={{ borderColor: 'var(--line)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
                  Current Leaderboard Document
                </h2>
              </div>
              <p className="text-xs text-[var(--mut)] mt-0.5">
                Path: <code className="text-[#ff4800]">leaderboard/top</code> · Max 10 entries
              </p>
            </div>

            <span className="text-xs text-[var(--mut)]">
              {isFirebaseConfigured ? '⚡ Firebase Spark' : 'Local Preview'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[var(--mut)]">
              Loading entries...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--mut)]">
              No entries in leaderboard. Use the form on the left to add one.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {entries.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-xs text-[var(--mut)]">
                      #{idx + 1}
                    </span>
                    <div>
                      <b className="text-[var(--fg)]">{item.name}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#ff4800] font-extrabold text-sm sm:text-base">
                      {item.paidCount} paid
                    </span>

                    <button
                      onClick={() => handleQuickIncrement(idx)}
                      disabled={saving}
                      title="Add 1 paid client"
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold hover:bg-[var(--bg)] cursor-pointer"
                      style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}
                    >
                      +1
                    </button>

                    <button
                      onClick={() => handleRemoveEntry(idx)}
                      disabled={saving}
                      title="Remove from leaderboard"
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex flex-wrap justify-between items-center gap-3 text-xs text-[var(--mut)]" style={{ borderColor: 'var(--line)' }}>
            <span>
              Firestore reads on Dashboard are limited to 1 read per visitor load.
            </span>
            <button
              onClick={async () => {
                setSaving(true);
                const res = await updateTopLeaderboard(entries, CONFIG.adminEmail);
                if (res.success) {
                  setFeedback({ type: 'success', message: 'Leaderboard document re-synced.' });
                }
                setSaving(false);
              }}
              disabled={saving}
              className="agency-btn text-xs cursor-pointer"
            >
              Force Sync Document
            </button>
          </div>
        </div>
      </div>

      {/* Incoming Partner & Affiliate Applications Section */}
      <div className="agency-card mt-8 rv in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b gap-3" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
                Partner & Affiliate Applications
              </h2>
            </div>
            <p className="text-xs text-[var(--mut)] mt-1">
              Live submissions written directly into Firestore <code className="text-[#ff4800]">applications</code> collection. Full contact details visible to Admin only.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full border bg-[var(--bg)] font-semibold" style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
              {applications.filter((a) => a.status === 'pending').length} Pending
            </span>
            <button
              onClick={async () => {
                setAppsLoading(true);
                const res = await fetchPartnerApplications();
                if (res.applications && res.applications.length > 0) {
                  setApplications(res.applications);
                }
                setAppsLoading(false);
              }}
              disabled={appsLoading}
              className="agency-btn text-xs py-1.5 px-3 cursor-pointer"
            >
              {appsLoading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {appsLoading ? (
          <div className="py-12 text-center text-sm text-[var(--mut)]">
            Loading incoming applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--mut)]">
            No applications received yet. Submissions from the <a href="#affiliates" className="text-[#ff4800] underline">Affiliates application form</a> will automatically appear here.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {applications.map((app) => {
              const isActionLoading = actionLoadingId === app.id;
              const formattedDate = new Date(app.appliedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={app.id} className="py-5 flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="text-base font-bold text-[var(--fg)]">
                        {app.applicantName}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          app.type === 'sales_team'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            : 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                        }`}
                      >
                        {app.type === 'sales_team' ? '👥 Sales Team' : '👤 Individual Affiliate'}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : app.status === 'rejected'
                            ? 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        {app.status.toUpperCase()}
                      </span>

                      {app.generatedCode && (
                        <span className="text-xs font-mono font-bold text-[#ff4800] px-2 py-0.5 rounded bg-[var(--bg)] border" style={{ borderColor: 'var(--line)' }}>
                          Code: {app.generatedCode}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-[var(--mut)] mb-3">
                      <div>
                        <strong className="text-[var(--fg)]">Phone: </strong>
                        <a
                          href={`tel:${app.phone}`}
                          className="hover:text-[#ff4800] underline font-medium"
                        >
                          {app.phone}
                        </a>
                      </div>
                      {app.platform && (
                        <div>
                          <strong className="text-[var(--fg)]">Channel: </strong>
                          {app.platform}
                        </div>
                      )}
                      {app.reach && (
                        <div>
                          <strong className="text-[var(--fg)]">Reach: </strong>
                          {app.reach}
                        </div>
                      )}
                      {app.teamSize && (
                        <div>
                          <strong className="text-[var(--fg)]">Team Size: </strong>
                          {app.teamSize}
                        </div>
                      )}
                      {app.targetRange && (
                        <div>
                          <strong className="text-[var(--fg)]">Target Range: </strong>
                          {app.targetRange}
                        </div>
                      )}
                      <div>
                        <strong className="text-[var(--fg)]">Date: </strong>
                        {formattedDate}
                      </div>
                    </div>

                    {app.pitch && (
                      <div className="p-3 rounded-xl bg-[var(--bg)] border text-xs text-[var(--fg)] leading-relaxed italic" style={{ borderColor: 'var(--line)' }}>
                        "{app.pitch}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col justify-end items-center gap-2 self-start min-w-[170px]">
                    <a
                      href={getWhatsAppUrl(`Hello ${app.applicantName}, thanks for applying to Upskilltown Agency!`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agency-btn text-xs py-2 px-3 w-full text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>💬 Chat WhatsApp</span>
                    </a>

                    {app.status === 'pending' ? (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                          disabled={isActionLoading}
                          className="agency-btn p text-xs py-2 px-3 flex-1 text-center cursor-pointer"
                        >
                          {isActionLoading ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                          disabled={isActionLoading}
                          className="px-3 py-2 text-xs rounded-xl border text-red-500 hover:text-red-700 cursor-pointer"
                          style={{ borderColor: 'var(--line)' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpdateAppStatus(app.id, app.status === 'approved' ? 'pending' : 'approved')}
                        disabled={isActionLoading}
                        className="text-xs text-[var(--mut)] hover:text-[var(--fg)] underline py-1"
                      >
                        Reset to {app.status === 'approved' ? 'Pending' : 'Approved'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t flex flex-wrap justify-between items-center text-xs text-[var(--mut)]" style={{ borderColor: 'var(--line)' }}>
          <span>
            Spark Plan Safety: Fetches are paginated to 30 items to strictly respect free Firestore read limits.
          </span>
          <span>
            Database: <code className="text-[#ff4800]">{isFirebaseConfigured ? 'Live Firestore' : 'Preview Mode'}</code>
          </span>
        </div>
      </div>
    </div>
  );
};
