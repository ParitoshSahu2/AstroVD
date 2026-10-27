/**
 * Centralized Authentication & Session Management Utility for AstroVD
 * 
 * Handles token storage, user profiles, reactive auth broadcasting,
 * secure logout (with server-side tokenVersion invalidation),
 * and route protection guards.
 */

export interface StoredUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  status: string;
  walletBalance?: number;
  [key: string]: any;
}

export const TOKEN_STORAGE_KEY = 'astro_token';
export const USER_STORAGE_KEY = 'astro_user';
export const AUTH_CHANGE_EVENT = 'astro-auth-change';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error('Error reading auth token:', err);
    return null;
  }
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch (err) {
    console.error('Error parsing stored user:', err);
    return null;
  }
}

export function setAuthSession(token: string, user: StoredUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    // Broadcast auth change across the entire window and other tabs
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: { user, token } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error saving auth session:', err);
  }
}

export function isProtectedPath(pathname?: string): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.split('?')[0].toLowerCase();
  return (
    cleanPath === '/dashboard' ||
    cleanPath.startsWith('/dashboard/') ||
    cleanPath === '/profile' ||
    cleanPath.startsWith('/profile/') ||
    cleanPath === '/admin' ||
    cleanPath.startsWith('/admin/')
  );
}

export interface LogoutOptions {
  redirectUrl?: string;
  notifyServer?: boolean;
}

/**
 * Performs a complete, secure logout across the application:
 * 1. Calls backend /api/auth/logout to invalidate tokenVersion in PostgreSQL
 * 2. Clears tokens, user profiles, and session storage
 * 3. Broadcasts astro-auth-change to reset all React state (cart, dashboard, admin)
 * 4. Redirects to /login if on a protected route or if redirectUrl is requested
 */
export async function performLogout(options: LogoutOptions = {}): Promise<void> {
  const token = getAuthToken();
  const backendBaseUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');

  // 1. Notify backend to increment tokenVersion and record audit log (if token present)
  if (token && options.notifyServer !== false) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      await fetch(`${backendBaseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }).catch(() => {});

      clearTimeout(timeoutId);
    } catch {
      // Failure to reach server (e.g. offline) must NOT prevent client-side logout
    }
  }

  // 2. Clear client storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('astro_cart');
      localStorage.removeItem('astro_cart_guest');

      // Clear all user and guest cart storage keys so no lingering cart items remain on logout
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('astro_cart') || key.startsWith('astro_order'))) {
          localStorage.removeItem(key);
        }
      }

      sessionStorage.clear();
    } catch (err) {
      console.error('Error clearing storage on logout:', err);
    }

    // 3. Dispatch global events
    try {
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error dispatching logout event:', err);
    }

    // 4. Handle Redirection
    const currentPath = window.location.pathname;
    const isCartOrCheckout = currentPath === '/cart' || currentPath.startsWith('/cart');
    const shouldRedirect = Boolean(options.redirectUrl) || isProtectedPath(currentPath) || isCartOrCheckout;

    if (shouldRedirect) {
      const targetUrl =
        options.redirectUrl ||
        (isCartOrCheckout
          ? '/'
          : `/login?redirect=${encodeURIComponent(currentPath)}&loggedOut=true`);
      
      // Use window.location.replace so browser history does not retain protected page
      window.location.replace(targetUrl);
    }
  }
}
