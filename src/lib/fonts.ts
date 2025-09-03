import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';

export const mangoGrotesque = localFont({
  src: [
    {
      path: '../../public/fonts/MangoGrotesque-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MangoGrotesque-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MangoGrotesque-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MangoGrotesque-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MangoGrotesque-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MangoGrotesque-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-mango-grotesque',
  display: 'swap',
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto',
  display: 'swap',
});
