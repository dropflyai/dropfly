import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'VoiceFly - AI-Powered Voice Agents',
    template: '%s | VoiceFly',
  },
  description:
    'Automate your outbound calls with intelligent AI voice agents. Scale your sales, support, and outreach with human-like conversations.',
  keywords: [
    'AI voice agents',
    'automated calling',
    'sales automation',
    'voice AI',
    'outbound calls',
    'conversational AI',
  ],
  authors: [{ name: 'VoiceFly' }],
  creator: 'VoiceFly',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://voicefly.ai',
    siteName: 'VoiceFly',
    title: 'VoiceFly - AI-Powered Voice Agents',
    description:
      'Automate your outbound calls with intelligent AI voice agents. Scale your sales, support, and outreach with human-like conversations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoiceFly - AI-Powered Voice Agents',
    description:
      'Automate your outbound calls with intelligent AI voice agents.',
    creator: '@voicefly',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--color-bg-base)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
