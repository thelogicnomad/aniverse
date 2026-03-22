import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  themeColor: '#7C3AED',
};

export const metadata: Metadata = {
  title: { default: 'AniVerse — Watch Anime Online', template: '%s | AniVerse' },
  description: 'Stream the latest and greatest anime in HD. Sub & Dub available.',
  keywords: ['anime', 'streaming', 'watch anime', 'sub', 'dub'],
  openGraph: {
    siteName: 'AniVerse',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-white antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        
      </body>
    </html>
  );
}
