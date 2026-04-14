import { Injectable } from '@angular/core';

/**
 * SessionCleanupService
 *
 * Single source of truth for wiping every client-side storage layer on logout
 * or session expiry. Call `purgeAll()` before navigating away from any protected page.
 *
 * Layers cleared:
 *  1. localStorage       — persisted user profile, tokens cached by the app
 *  2. sessionStorage     — any tab-scoped values (forms, temporary state)
 *  3. document.cookie    — non-HttpOnly cookies the JS layer can reach
 *                          (HttpOnly cookies are cleared server-side via the logout API)
 *  4. IndexedDB          — Angular, NgRx DevTools, or 3rd-party libs sometimes write here
 *  5. Cache API          — Service-worker caches (if PWA is ever added)
 */
@Injectable({ providedIn: 'root' })
export class SessionCleanupService {

  /**
   * Synchronously wipe localStorage + sessionStorage and
   * best-effort clear any JS-reachable cookies.
   * Call this immediately before dispatching the logout action.
   */
  purgeAll(): void {
    this.clearLocalStorage();
    this.clearSessionStorage();
    this.clearJsCookies();
    // Async cleaners are best-effort — fire and forget
    void this.clearIndexedDb();
    void this.clearCacheApi();
  }

  // ─── Storage layers ──────────────────────────────────────────────────────────

  private clearLocalStorage(): void {
    try {
      localStorage.clear();
    } catch {
      // Private-browsing or quota errors — ignore
    }
  }

  private clearSessionStorage(): void {
    try {
      sessionStorage.clear();
    } catch {
      // Private-browsing or quota errors — ignore
    }
  }

  /**
   * Expire every cookie the JavaScript context can read.
   * HttpOnly cookies (access_token, refresh_token) are cleared server-side
   * via the logout API — this covers any non-HttpOnly fallback cookies.
   */
  private clearJsCookies(): void {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (!name) continue;

        // Expire on every known path so browser removes the entry
        const expireStr = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = `${name}=;${expireStr};path=/`;
        document.cookie = `${name}=;${expireStr};path=/api`;
        document.cookie = `${name}=;${expireStr};path=/api/v1/auth`;
      }
    } catch {
      // DOM not available (SSR guard)
    }
  }

  /**
   * Delete all IndexedDB databases accessible to this origin.
   * Angular's AngularIndexedDb, NgRx DevTools, and 3rd-party SDKs may use these.
   */
  private async clearIndexedDb(): Promise<void> {
    try {
      if (!('indexedDB' in window) || !indexedDB.databases) return;
      const dbs = await indexedDB.databases();
      await Promise.all(
        dbs.map(
          (db) =>
            new Promise<void>((resolve) => {
              if (!db.name) return resolve();
              const req = indexedDB.deleteDatabase(db.name);
              req.onsuccess = () => resolve();
              req.onerror = () => resolve();   // non-blocking
              req.onblocked = () => resolve();
            }),
        ),
      );
    } catch {
      // Older browsers lack indexedDB.databases()
    }
  }

  /**
   * Delete all Cache API entries (Service Worker / PWA caches).
   */
  private async clearCacheApi(): Promise<void> {
    try {
      if (!('caches' in window)) return;
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      // Cache API not supported
    }
  }
}
