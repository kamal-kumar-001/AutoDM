import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.dmpilot.org'),
  title: 'AutoDM - DM Automation',
  description: 'Scale your creator presence with high-performance Instagram DM automation.',
  openGraph: {
    title: 'AutoDM - DM Automation',
    description: 'Scale your creator presence with high-performance Instagram DM automation.',
    url: 'https://www.dmpilot.org',
    siteName: 'AutoDM',
    images: [
      {
        url: 'https://www.dmpilot.org/icon.svg',
        width: 1200,
        height: 630,
        alt: 'AutoDM Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  verification: {
    google: 'HFp8bpyG41psm7hb5aYEgShOZ50wfwEnVCsbBKZEfp8',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoDM - Instagram DM Automation',
    description: 'Scale your creator presence with high-performance Instagram DM automation.',
    images: ['https://www.dmpilot.org/icon.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={`${inter.className} bg-background text-foreground antialiased min-h-screen relative`}
      >
        <div className="noise-overlay" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
