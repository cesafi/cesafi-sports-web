import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';

export const moderniz = localFont({
  src: [
    {
      path: '../../public/fonts/moderniz/Moderniz.otf',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-moderniz',
  display: 'swap'
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto',
  display: 'swap'
});
