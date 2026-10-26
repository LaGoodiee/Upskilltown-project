// ============================================================================
// FIREBASE CONFIGURATION (Spark Plan - Free Tier Only)
// Connected project: upskilltown-5af2d
// ============================================================================
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyByRrfxLf62ro7bvdGUtTH6PviWtLZDlhw",
  authDomain: "upskilltown-5af2d.firebaseapp.com",
  projectId: "upskilltown-5af2d",
  storageBucket: "upskilltown-5af2d.firebasestorage.app",
  messagingSenderId: "75522889307",
  appId: "1:75522889307:web:ce4e434364238cc694517e",
};

// Pinned Firebase v10 Modular SDK CDN URLs (Auth and Firestore only)
export const FIREBASE_CDN_VERSIONS = {
  version: '10.14.1',
  app: 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js',
  auth: 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js',
  firestore: 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js',
};

// Check if valid Firebase configuration has been supplied
export const isFirebaseConfigured = Boolean(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.apiKey.trim() !== '' &&
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.projectId.trim() !== ''
);

export interface LeaderboardEntry {
  name: string;
  paidCount: number;
}

export interface LeaderboardDoc {
  entries: LeaderboardEntry[];
  updatedAt?: string;
  updatedBy?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo?: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentAuth?.uid || null,
      email: currentAuth?.email || null,
      emailVerified: currentAuth?.emailVerified || null,
      isAnonymous: currentAuth?.isAnonymous || null,
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Fallback leaderboard for preview / demo when offline
export const INITIAL_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { name: 'Emeka Okafor', paidCount: 14 },
  { name: 'Amina Bello', paidCount: 11 },
  { name: 'David Kalu', paidCount: 9 },
  { name: 'Folake Adeleke', paidCount: 8 },
  { name: 'Chinedu Eze', paidCount: 7 },
  { name: 'Blessing Udoh', paidCount: 6 },
  { name: 'Ibrahim Sani', paidCount: 5 },
  { name: 'Ngozi Okonjo', paidCount: 4 },
  { name: 'Tariq Al-Hassan', paidCount: 3 },
  { name: 'Somtochukwu N.', paidCount: 2 },
];

let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;

/**
 * Initializes and retrieves Firebase v10 modular services loaded from pinned CDN.
 * Respects custom firestoreDatabaseId if provisioned.
 */
export async function getFirebaseServices() {
  if (!isFirebaseConfigured) {
    return {
      app: null,
      auth: null,
      db: null,
      isConfigured: false,
    };
  }

  if (appInstance && authInstance && dbInstance) {
    return {
      app: appInstance,
      auth: authInstance,
      db: dbInstance,
      isConfigured: true,
    };
  }

  try {
    const { initializeApp, getApps, getApp } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.app
    );
    const { getAuth } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.auth
    );
    const { getFirestore } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.firestore
    );

    appInstance = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
    authInstance = getAuth(appInstance);
    dbInstance = (FIREBASE_CONFIG as Record<string, any>).firestoreDatabaseId
      ? getFirestore(appInstance, (FIREBASE_CONFIG as Record<string, any>).firestoreDatabaseId)
      : getFirestore(appInstance);

    return {
      app: appInstance,
      auth: authInstance,
      db: dbInstance,
      isConfigured: true,
    };
  } catch (error) {
    console.warn('Firebase modular SDK failed to load from CDN:', error);
    return {
      app: null,
      auth: null,
      db: null,
      isConfigured: false,
    };
  }
}

/**
 * Fetches the single leaderboard document ('leaderboard/top') to minimize Firestore reads.
 * Returns up to 10 entries (name and paidCount only).
 */
export async function fetchTopLeaderboard(): Promise<{
  entries: LeaderboardEntry[];
  isLive: boolean;
  updatedAt?: string;
}> {
  if (!isFirebaseConfigured) {
    const local = localStorage.getItem('upt_leaderboard');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return { entries: parsed.entries || INITIAL_LEADERBOARD_ENTRIES, isLive: false, updatedAt: parsed.updatedAt };
      } catch {
        // fallback
      }
    }
    return { entries: INITIAL_LEADERBOARD_ENTRIES, isLive: false };
  }

  const { db } = await getFirebaseServices();
  if (!db) {
    return { entries: INITIAL_LEADERBOARD_ENTRIES, isLive: false };
  }

  const path = 'leaderboard/top';
  try {
    const { doc, getDoc } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.firestore
    );
    const docRef = doc(db, 'leaderboard', 'top');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as LeaderboardDoc;
      const sanitized = (data.entries || [])
        .slice(0, 10)
        .map((e: any) => ({
          name: String(e.name || 'Anonymous'),
          paidCount: Number(e.paidCount || 0),
        }));
      return {
        entries: sanitized,
        isLive: true,
        updatedAt: data.updatedAt,
      };
    } else {
      return { entries: INITIAL_LEADERBOARD_ENTRIES, isLive: false };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return { entries: INITIAL_LEADERBOARD_ENTRIES, isLive: false };
  }
}

/**
 * Updates the single 'leaderboard/top' document from the browser.
 * Sanitizes entries: top 10 only, sorted descending, name and paidCount only (never phone numbers).
 */
export async function updateTopLeaderboard(
  rawEntries: LeaderboardEntry[],
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const sanitized = [...rawEntries]
    .filter((e) => e && e.name && e.name.trim().length > 0)
    .sort((a, b) => b.paidCount - a.paidCount)
    .slice(0, 10)
    .map((e) => ({
      name: e.name.trim(),
      paidCount: Math.max(0, Math.floor(e.paidCount)),
    }));

  const payload: LeaderboardDoc = {
    entries: sanitized,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'admin',
  };

  try {
    localStorage.setItem('upt_leaderboard', JSON.stringify(payload));
  } catch {
    // ignore
  }

  if (!isFirebaseConfigured) {
    return { success: true };
  }

  const { db } = await getFirebaseServices();
  if (!db) {
    return { success: false, error: 'Firestore service not available.' };
  }

  const path = 'leaderboard/top';
  try {
    const { doc, setDoc } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.firestore
    );
    const docRef = doc(db, 'leaderboard', 'top');
    await setDoc(docRef, payload);
    return { success: true };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return { success: false, error: err?.message || 'Firestore write failed.' };
  }
}

export interface PartnerApplication {
  id: string;
  type: 'individual_affiliate' | 'sales_team';
  applicantName: string;
  phone: string;
  platform?: string;
  reach?: string;
  pitch?: string;
  teamName?: string;
  leadName?: string;
  teamSize?: string;
  targetRange?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  generatedCode?: string;
}

/**
 * Submits an affiliate or partner application directly to the 'applications' Firestore collection.
 * Respects Spark free tier limits by writing a single small document per applicant.
 */
export async function submitPartnerApplication(
  data: Omit<PartnerApplication, 'id' | 'appliedAt' | 'status'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const newApp: PartnerApplication = {
    ...data,
    id: 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    status: 'pending',
    appliedAt: new Date().toISOString(),
  };

  // Keep a local copy in browser for instant responsiveness & offline fallback
  try {
    const existing = JSON.parse(localStorage.getItem('upt_partner_apps') || '[]');
    existing.unshift(newApp);
    localStorage.setItem('upt_partner_apps', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // ignore
  }

  if (!isFirebaseConfigured) {
    return { success: true, id: newApp.id };
  }

  const { db } = await getFirebaseServices();
  if (!db) {
    return { success: true, id: newApp.id };
  }

  const path = `applications/${newApp.id}`;
  try {
    const { doc, setDoc } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.firestore
    );
    const docRef = doc(db, 'applications', newApp.id);
    await setDoc(docRef, newApp);
    return { success: true, id: newApp.id };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return { success: false, error: err?.message || 'Failed to submit application to Firestore.' };
  }
}

/**
 * Fetches recent applications for the Admin page.
 * Uses query limit of 30 to strictly protect Spark plan read quotas.
 */
export async function fetchPartnerApplications(): Promise<{
  applications: PartnerApplication[];
  isLive: boolean;
}> {
  const localApps = (() => {
    try {
      return JSON.parse(localStorage.getItem('upt_partner_apps') || '[]');
    } catch {
      return [];
    }
  })();

  if (!isFirebaseConfigured) {
    return { applications: localApps, isLive: false };
  }

  const { db } = await getFirebaseServices();
  if (!db) {
    return { applications: localApps, isLive: false };
  }

  const path = 'applications';
  try {
    const { collection, getDocs, query, limit } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.firestore
    );
    const q = query(collection(db, 'applications'), limit(30));
    const snapshot = await getDocs(q);
    const list: PartnerApplication[] = [];
    snapshot.forEach((d: any) => {
      list.push({ ...(d.data() as PartnerApplication), id: d.id });
    });
    list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    return { applications: list, isLive: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return { applications: localApps, isLive: false };
  }
}

/**
 * Updates an applicant's status ('pending', 'approved', or 'rejected') from the Admin panel.
 */
export async function updatePartnerApplicationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const local = JSON.parse(localStorage.getItem('upt_partner_apps') || '[]');
    const updated = local.map((a: PartnerApplication) =>
      a.id === id ? { ...a, status } : a
    );
    localStorage.setItem('upt_partner_apps', JSON.stringify(updated));
  } catch {
    // ignore
  }

  if (!isFirebaseConfigured) {
    return { success: true };
  }

  const { db } = await getFirebaseServices();
  if (!db) {
    return { success: false, error: 'Database service unavailable' };
  }

  const path = `applications/${id}`;
  try {
    const { doc, updateDoc } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.firestore
    );
    const docRef = doc(db, 'applications', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    return { success: false, error: err?.message || 'Failed to update application status.' };
  }
}

/**
 * Initiates Google sign-in via popup using Firebase Auth.
 */
export async function signInWithGooglePopup(): Promise<{ user: any | null; error: string | null }> {
  if (!isFirebaseConfigured) {
    return { user: null, error: 'Firebase is not configured yet' };
  }
  const { auth } = await getFirebaseServices();
  if (!auth) {
    return { user: null, error: 'Firebase Auth is not available' };
  }
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import(
      /* @vite-ignore */ FIREBASE_CDN_VERSIONS.auth
    );
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (err: any) {
    console.warn('Google sign-in popup error:', err);
    return { user: null, error: err?.message || 'Failed to sign in with Google' };
  }
}


