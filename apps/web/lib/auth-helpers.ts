import { signOut } from 'next-auth/react';

/**
 * Single-click logout handler that clears client session cache and redirects to /login?logged_out=1,
 * preventing stale NextAuth session context from auto-redirecting back to /dashboard.
 */
export const handleLogout = async () => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.clear();
      localStorage.removeItem('nextauth.message');
    } catch (error) {
      // Ignore browser storage access errors in restricted contexts
    }
  }
  await signOut({ redirect: true, callbackUrl: '/login?logged_out=1' });
};
