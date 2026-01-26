/**
 * Root Layout for BookFly Web
 *
 * Sets up the base HTML structure, fonts, and global providers.
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

// Load Inter font with Latin subset
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// App metadata for SEO and browser
export const metadata: Metadata = {
  title: {
    default: 'BookFly - QuickBooks AI Entry',
    template: '%s | BookFly',
  },
  description:
    'AI-powered bookkeeping assistant. Snap receipts, auto-categorize transactions, and sync to QuickBooks.',
  keywords: ['bookkeeping', 'QuickBooks', 'AI', 'receipts', 'accounting', 'automation'],
  authors: [{ name: 'DropFly' }],
  creator: 'DropFly',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-neutral-50 font-sans antialiased">
        {/* Main content */}
        {children}

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'bg-white border border-neutral-200 shadow-lg',
              title: 'text-neutral-900 font-medium',
              description: 'text-neutral-600',
              success: 'border-success-200 bg-success-50',
              error: 'border-error-200 bg-error-50',
              warning: 'border-warning-200 bg-warning-50',
            },
          }}
          closeButton
          richColors
        />
      </body>
    </html>
  );
}
