/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ProcessedIncidentReport } from './types';

let db: any = null;
let initPromise: Promise<any> | null = null;

/**
 * Dynamically retrieves and initializes the Firestore client instance.
 * Avoids hardcoding secrets and guarantees portability across Cloud environments.
 */
export async function getClientDb() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = fetch('/api/firebase-config')
    .then((res) => {
      if (!res.ok) throw new Error('Could not fetch Firebase configuration from the server.');
      return res.json();
    })
    .then((config) => {
      const app = initializeApp(config);
      db = getFirestore(app);
      console.log('[FirebaseClient] Firestore Client SDK initialized successfully.');
      return db;
    })
    .catch((err) => {
      console.warn('[FirebaseClient] Client SDK initialization failed, utilizing backend REST routes fallback:', err.message);
      db = null;
      initPromise = null;
      throw err;
    });

  return initPromise;
}

/**
 * Subscribes to real-time reports from Google Cloud Firestore.
 * Provides live updates for both citizens and municipal dashboards instantly.
 */
export function subscribeToReports(
  onUpdate: (reports: ProcessedIncidentReport[]) => void,
  onError?: (err: any) => void
): () => void {
  let unsubscribe: (() => void) | null = null;
  let active = true;

  getClientDb()
    .then((clientDb) => {
      if (!active) return;
      const q = query(collection(clientDb, 'reports'), orderBy('createdAt', 'desc'));
      
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ProcessedIncidentReport[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as ProcessedIncidentReport);
          });
          onUpdate(list);
        },
        (err) => {
          console.error('[FirebaseClient] Real-time update stream error:', err);
          if (onError) onError(err);
        }
      );
    })
    .catch((err) => {
      console.warn('[FirebaseClient] Direct Firestore subscription failed, running polling fallback:', err.message);
      
      // Resilient fallback: fetch immediately and start standard periodic polling to keep dashboard active
      const fetchAndTrigger = () => {
        fetch('/api/reports')
          .then((res) => {
            if (!res.ok) throw new Error('REST API unavailable');
            return res.json();
          })
          .then((data) => {
            if (active) onUpdate(data);
          })
          .catch((fetchErr) => {
            console.error('[FirebaseClient] Fallback polling failed:', fetchErr);
            if (onError) onError(fetchErr);
          });
      };

      fetchAndTrigger();
      const intervalId = setInterval(fetchAndTrigger, 5000);

      const oldUnsubscribe = unsubscribe;
      unsubscribe = () => {
        clearInterval(intervalId);
        if (oldUnsubscribe) oldUnsubscribe();
      };
    });

  return () => {
    active = false;
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
