import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiRequest } from './api-client';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    isVerified: boolean;
  };
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback_nextauth_secret_must_change_in_prod',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const data = await apiRequest<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            isVerified: data.user.isVerified,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error('NextAuth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000 - 10 * 1000, // 15 mins (minus 10s buffer)
          user: {
            id: user.id,
            email: user.email!,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
          },
        };
      }

      // Return previous token if the access token has not expired yet or already failed to refresh
      if (Date.now() < token.accessTokenExpires || token.error === 'RefreshAccessTokenError') {
        return token;
      }

      // Access token has expired, try to update it
      try {
        const refreshedTokens = await apiRequest<RefreshResponse>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({
            refreshToken: token.refreshToken,
          }),
        });

        return {
          ...token,
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000 - 10 * 1000, // 15 mins (minus 10s buffer)
        };
      } catch (error) {
        console.error('Error refreshing access token', error);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user = {
        ...session.user,
        id: token.user.id,
        email: token.user.email,
        name: token.user.name,
        role: token.user.role,
        isVerified: token.user.isVerified,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
