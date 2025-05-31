import type { Metadata } from 'next';
import { Geist, Geist_Mono, Spicy_Rice } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const spicyRice = Spicy_Rice({
  variable: '--font-spicy-rice',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Kawaii Sky',
  description: 'A kawaii endless runner adventure',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spicyRice.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
