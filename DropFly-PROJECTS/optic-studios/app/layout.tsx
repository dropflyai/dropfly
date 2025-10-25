import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://opticstudios.ai'),
  title: {
    default: 'Optic Studios | AI-Powered Film & TV Production | Leading Cinematography Innovation',
    template: '%s | Optic Studios'
  },
  description: 'Revolutionary AI cinematography studio combining artificial intelligence with traditional filmmaking. Netflix, Apple, HBO trusted. 10x faster production, 70% cost reduction. Neural scene generation, AI actors, deep compositing.',
  keywords: [
    'AI cinematography',
    'artificial intelligence film production',
    'AI video production',
    'neural scene generation',
    'AI actors',
    'film production company',
    'TV production services',
    'AI-powered filmmaking',
    'machine learning video',
    'computer vision cinematography',
    'deep learning film',
    'AI post-production',
    'virtual production',
    'AI VFX',
    'generative AI video',
    'AI color grading',
    'synthetic media production',
    'AI film studio',
    'future of filmmaking',
    'AI content creation'
  ],
  authors: [{ name: 'Optic Studios' }],
  creator: 'Optic Studios LLC',
  publisher: 'Optic Studios LLC',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://opticstudios.ai',
    title: 'Optic Studios - Leading AI Cinematography Revolution',
    description: 'Where AI meets artistry. Revolutionary film & TV production using cutting-edge artificial intelligence. Trusted by Netflix, Apple, HBO.',
    siteName: 'Optic Studios',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Optic Studios - AI Cinematography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Optic Studios - AI-Powered Cinematography',
    description: 'Revolutionary AI film & TV production. 10x faster, 70% cost reduction.',
    site: '@opticstudios',
    creator: '@opticstudios',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://opticstudios.ai',
  },
  category: 'Film Production',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Optic Studios LLC',
    description: 'AI-powered film and television production company',
    url: 'https://opticstudios.ai',
    logo: 'https://opticstudios.ai/logo.png',
    foundingDate: '2020',
    founders: [
      {
        '@type': 'Person',
        name: 'Michael Chen',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Los Angeles',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'customer service',
      email: 'hello@opticstudios.ai',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://www.linkedin.com/company/opticstudios',
      'https://twitter.com/opticstudios',
      'https://www.instagram.com/opticstudios',
      'https://vimeo.com/opticstudios',
    ],
    knowsAbout: [
      'AI Cinematography',
      'Film Production',
      'Television Production',
      'Commercial Production',
      'Post-Production',
      'Visual Effects',
      'Machine Learning',
      'Computer Vision',
      'Neural Rendering',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AI cinematography?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI cinematography uses artificial intelligence and machine learning to enhance or generate visual content, including scene generation, color grading, and visual effects.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much faster is AI-powered production?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI-powered production pipeline is typically 10x faster than traditional methods, reducing months of work to weeks.',
        },
      },
      {
        '@type': 'Question',
        name: 'What clients has Optic Studios worked with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We have partnered with major studios including Netflix, Apple, HBO, Disney+, Amazon, and Meta.',
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* Preconnect to optimize loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* Analytics Scripts - Replace with your IDs */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  );
}
