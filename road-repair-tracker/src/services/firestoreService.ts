/**
 * Firestore Service
 * Provides real-time database operations for Complaints and Contractors,
 * mirroring the existing in-memory store API but backed by Firebase Firestore.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Complaint } from './complaintsStore';
import { ContractorProfile, EmailThread, ContractorMessage } from './contractorEmailStore';

// ─── Collection References ───────────────────────────────────────────────────
const COMPLAINTS_COL = 'complaints';
const CONTRACTORS_COL = 'contractors';
const THREADS_COL = 'emailThreads';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert Firestore Timestamp fields to ISO strings for our app types */
function normalizeTimestamp(data: DocumentData): any {
  const result: any = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate().toISOString();
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLAINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Seed Firestore with initial complaints if the collection is empty.
 * Call once at app startup.
 */
export async function seedComplaintsIfEmpty(initialComplaints: Complaint[]): Promise<void> {
  const snapshot = await getDocs(collection(db, COMPLAINTS_COL));
  if (!snapshot.empty) return; // Already seeded

  const writes = initialComplaints.map((complaint) =>
    setDoc(doc(db, COMPLAINTS_COL, complaint.id), {
      ...complaint,
      _createdAt: serverTimestamp(),
    })
  );
  await Promise.all(writes);
  console.log('[Firestore] Seeded', initialComplaints.length, 'complaints.');
}

/**
 * Add a new complaint to Firestore.
 */
export async function addComplaintToFirestore(complaint: Complaint): Promise<void> {
  await setDoc(doc(db, COMPLAINTS_COL, complaint.id), {
    ...complaint,
    _createdAt: serverTimestamp(),
  });
}

/**
 * Update complaint status (and optional assignedContractor) in Firestore.
 */
export async function updateComplaintStatusInFirestore(
  id: string,
  status: Complaint['status'],
  assignedContractor?: string
): Promise<void> {
  const ref = doc(db, COMPLAINTS_COL, id);
  await updateDoc(ref, {
    status,
    ...(assignedContractor ? { assignedContractor } : {}),
    _updatedAt: serverTimestamp(),
  });
}

/**
 * Delete complaint from Firestore.
 */
export async function deleteComplaintFromFirestore(id: string): Promise<void> {
  const ref = doc(db, COMPLAINTS_COL, id);
  await deleteDoc(ref);
}

/**
 * Subscribe to real-time complaint updates.
 * Returns an unsubscribe function.
 */
export function subscribeToComplaints(
  callback: (complaints: Complaint[]) => void
): () => void {
  const q = query(collection(db, COMPLAINTS_COL), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const complaints: Complaint[] = snapshot.docs.map((d) => {
      const data = normalizeTimestamp(d.data());
      return { ...data, id: d.id } as Complaint;
    });
    callback(complaints);
  });
}

/**
 * Fetch all complaints once (non-reactive).
 */
export async function fetchComplaints(): Promise<Complaint[]> {
  const q = query(collection(db, COMPLAINTS_COL), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = normalizeTimestamp(d.data());
    return { ...data, id: d.id } as Complaint;
  });
}

/**
 * Fetch a single complaint by ID.
 */
export async function fetchComplaintById(id: string): Promise<Complaint | null> {
  const ref = doc(db, COMPLAINTS_COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { ...normalizeTimestamp(snap.data()), id: snap.id } as Complaint;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACTORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Seed Firestore with contractor profiles if the collection is empty.
 */
export async function seedContractorsIfEmpty(contractors: ContractorProfile[]): Promise<void> {
  const snapshot = await getDocs(collection(db, CONTRACTORS_COL));
  if (!snapshot.empty) return;

  const writes = contractors.map((c) =>
    setDoc(doc(db, CONTRACTORS_COL, c.id), c)
  );
  await Promise.all(writes);
  console.log('[Firestore] Seeded', contractors.length, 'contractors.');
}

/**
 * Fetch all contractor profiles.
 */
export async function fetchContractors(): Promise<ContractorProfile[]> {
  const snapshot = await getDocs(collection(db, CONTRACTORS_COL));
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as ContractorProfile));
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL THREADS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Seed Firestore with initial email threads if the collection is empty.
 */
export async function seedThreadsIfEmpty(threads: EmailThread[]): Promise<void> {
  const snapshot = await getDocs(collection(db, THREADS_COL));
  if (!snapshot.empty) return;

  const writes = threads.map((t) =>
    setDoc(doc(db, THREADS_COL, t.threadId), {
      ...t,
      _createdAt: serverTimestamp(),
    })
  );
  await Promise.all(writes);
  console.log('[Firestore] Seeded', threads.length, 'email threads.');
}

/**
 * Save a new email thread to Firestore.
 */
export async function addThreadToFirestore(thread: EmailThread): Promise<void> {
  await setDoc(doc(db, THREADS_COL, thread.threadId), {
    ...thread,
    _createdAt: serverTimestamp(),
  });
}

/**
 * Update an existing email thread in Firestore (e.g. after a reply).
 */
export async function updateThreadInFirestore(thread: EmailThread): Promise<void> {
  const ref = doc(db, THREADS_COL, thread.threadId);
  await updateDoc(ref, {
    ...thread,
    _updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an email thread from Firestore.
 */
export async function deleteThreadFromFirestore(threadId: string): Promise<void> {
  await deleteDoc(doc(db, THREADS_COL, threadId));
}

/**
 * Subscribe to real-time email thread updates.
 * Returns an unsubscribe function.
 */
export function subscribeToThreads(
  callback: (threads: EmailThread[]) => void
): () => void {
  const q = query(collection(db, THREADS_COL), orderBy('lastUpdated', 'desc'));
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const threads: EmailThread[] = snapshot.docs.map((d) => {
      const data = normalizeTimestamp(d.data());
      return { ...data, threadId: d.id } as EmailThread;
    });
    callback(threads);
  });
}

/**
 * Fetch all email threads once.
 */
export async function fetchThreads(): Promise<EmailThread[]> {
  const q = query(collection(db, THREADS_COL), orderBy('lastUpdated', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = normalizeTimestamp(d.data());
    return { ...data, threadId: d.id } as EmailThread;
  });
}
