import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import { ToastProvider } from '@/contexts/toast-context';
import { ToastContainer } from '@/components/ui/toast-container';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SaukiMart — Buy Data, Pay Bills & Shop',
  description:
    "Nigeria's most trusted digital services platform. Buy mobile data, pay electricity bills, and shop for gadgets from one wallet.",
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
        alt: 'SaukiMart',
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
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#F9F9F9" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>
      <body className="font-inter antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
