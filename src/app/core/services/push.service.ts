import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { API_URL } from './api.service';
import { NotificationService } from './notification.service';

// Firebase compat SDK is loaded from the CDN at runtime (see loadSdk()), so it
// lives on the global scope rather than as an imported module.
declare const firebase: any;

const FIREBASE_CDN = 'https://www.gstatic.com/firebasejs/10.12.2';
const TOKEN_KEY = 'fcmToken';

/**
 * Free push notifications for tenants via Firebase Cloud Messaging.
 * The SDK is lazy-loaded so only users who enable reminders pay the cost.
 */
@Injectable({ providedIn: 'root' })
export class PushService {
  private http = inject(HttpClient);
  private toast = inject(NotificationService);

  private sdkPromise?: Promise<void>;
  private messaging: any;

  /** Browser can receive web push at all. */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /** Firebase keys have actually been filled in (not the scaffold placeholders). */
  isConfigured(): boolean {
    const cfg = (environment as any).firebase;
    return Boolean(cfg?.apiKey) && !String(cfg.apiKey).startsWith('YOUR_');
  }

  get permission(): NotificationPermission {
    return this.isSupported() ? Notification.permission : 'denied';
  }

  /** True once this device has a token registered with the backend. */
  get isEnabled(): boolean {
    return this.permission === 'granted' && !!localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Ask permission, obtain an FCM token and register it with the server.
   * Returns true on success. Throws Error with a human message on failure.
   */
  async enable(): Promise<boolean> {
    if (!this.isSupported()) throw new Error('This browser does not support push notifications.');
    if (!this.isConfigured()) throw new Error('Push notifications are not set up yet. Ask the admin to configure Firebase.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission was blocked.');

    await this.loadSdk();
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const token = await this.messaging.getToken({
      vapidKey: (environment as any).firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) throw new Error('Could not obtain a device token.');

    await this.http.post(`${API_URL}/notifications/fcm-token`, { token }).toPromise();
    localStorage.setItem(TOKEN_KEY, token);
    this.listenForeground();
    return true;
  }

  /** Unregister this device so it stops receiving push. */
  async disable(): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    try {
      if (this.messaging && token) await this.messaging.deleteToken();
    } catch {
      /* token may already be gone */
    }
    if (token) {
      await this.http
        .request('delete', `${API_URL}/notifications/fcm-token`, { body: { token } })
        .toPromise()
        .catch(() => {});
    }
  }

  /** Show a toast when a push arrives while the app is open. */
  private listenForeground(): void {
    if (!this.messaging) return;
    this.messaging.onMessage((payload: any) => {
      const body = payload?.notification?.body || payload?.data?.body || 'New notification';
      this.toast.show(body, 'info', 8000);
    });
  }

  /** Inject the Firebase compat scripts once and initialise messaging. */
  private loadSdk(): Promise<void> {
    if (this.sdkPromise) return this.sdkPromise;
    this.sdkPromise = this.injectScript(`${FIREBASE_CDN}/firebase-app-compat.js`)
      .then(() => this.injectScript(`${FIREBASE_CDN}/firebase-messaging-compat.js`))
      .then(() => {
        if (!firebase.apps.length) firebase.initializeApp((environment as any).firebase);
        this.messaging = firebase.messaging();
      });
    return this.sdkPromise;
  }

  private injectScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error('Failed to load Firebase SDK.'));
      document.head.appendChild(el);
    });
  }
}
