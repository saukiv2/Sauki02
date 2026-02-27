// Move existing app/layout.tsx to src/app/layout.tsx
// This will be overwritten below - moving it to src structure

import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'SaukiMart — Buy Data, Pay Bills & Shop',
  description: 'Nigeria\'s most trusted digital services platform. Buy mobile data, pay electricity bills, and shop for gadgets from one wallet.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon_32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/icon_180x180.png',
    shortcut: '/icons/icon_64x64.png',
  },
  openGraph: {
    title: 'SaukiMart',
    description: 'Buy data, pay electricity bills & shop — all from one wallet',
    url: 'https://www.saukimart.online',
    siteName: 'SaukiMart',
    images: [
      { 
        url: '/og_image.png', 
        width: 1200, 
        height: 630, 
        alt: 'SaukiMart' 
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="theme-color" content="#0A7AFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
