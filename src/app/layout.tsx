import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/contexts/query-provider';
import { Toaster } from '@/components/ui/sonner';
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from 'next-themes';
import { metadata as siteMetadata } from './metadata';
import { moderniz, roboto } from '@/lib/fonts';

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${moderniz.variable} ${roboto.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <NextTopLoader color="#336C61" />
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
