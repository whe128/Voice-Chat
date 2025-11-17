import { FC, ReactNode } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/provider/Providers';

interface Props {
  children: ReactNode;
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Voice-Chat',
  description: 'Learning platform for AI voice chat bots',
};

const RootLayout: FC<Props> = ({ children }) => (
  <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
