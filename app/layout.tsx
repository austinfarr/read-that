import { ThemeProvider } from '@/components/layout/theme-provider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import ApolloClientProvider from '@/components/providers/ApolloClientProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Read That - Your Personal Book Library',
  description: 'Track your reading list, explore new books, and manage your personal library',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'blue', 'purple']}
        >
          <ApolloClientProvider>
            <Navbar />
            {children}
          </ApolloClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
