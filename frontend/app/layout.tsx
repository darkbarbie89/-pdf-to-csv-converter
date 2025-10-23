import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pdftocsv.app'),
  title: {
    default: 'PDF to CSV Converter - Free Online Tool | Extract Tables from PDFs',
    template: '%s | PDF to CSV Converter'
  },
  description: 'Convert PDF tables to CSV files instantly. Free, secure, and accurate PDF to CSV conversion tool. No signup required. Extract data from PDFs in seconds.',
  keywords: ['PDF to CSV', 'PDF converter', 'table extraction', 'free PDF tool', 'convert PDF tables', 'PDF data extraction', 'online PDF converter'],
  authors: [{ name: 'PDF2CSV Team' }],
  openGraph: {
    title: 'PDF to CSV Converter - Free Online Tool',
    description: 'Extract tables from PDFs and convert them to CSV files instantly. Fast, secure, and completely free.',
    url: 'https://pdftocsv.app',
    siteName: 'PDF2CSV',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDF to CSV Converter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF to CSV Converter - Free Online Tool',
    description: 'Extract tables from PDFs and convert them to CSV files instantly.',
    images: ['/twitter-image.png'],
  },
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://pdftocsv.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}