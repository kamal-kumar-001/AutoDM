import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next static directories
     * - favicon
     * - login, register, forgot-password, reset-password, verify-email paths
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password|verify-email).*)',
  ],
};
