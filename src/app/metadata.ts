import { Metadata } from 'next';

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL!);

export const metadata: Metadata = {
  metadataBase: metadataBase,
  title: 'CESAFI | Official Collegiate Athletics in Cebu',
  description:
    'The official digital platform for Cebu Schools Athletic Foundation, Inc. (CESAFI). Get real-time updates, scores, news, schedules, standings, and team profiles for Cebuano collegiate athletics and education.', // Updated description
  keywords: [
    'CESAFI',
    'Cebu Sports',
    'Collegiate Athletics',
    'Philippines Sports',
    'Cebuano Sports',
    'Sports Results',
    'Game Schedules',
    'Team Profiles',
    'Live Scores',
    'News',
    'Basketball',
    'Volleyball',
    'Cebu Schools',
    'Academic Association'
  ],
  icons: {
    icon: [{ url: '/favicon.ico', href: '/favicon.ico' }]
  },
  openGraph: {
    title: 'CESAFI',
    description:
      'The official digital platform for Cebu Schools Athletic Foundation, Inc. (CESAFI). Get real-time updates, scores, news, schedules, standings, and team profiles for Cebuano collegiate athletics and education.', // Updated Open Graph description
    url: `${metadataBase}`,
    siteName: 'CESAFI | Cebu Schools Athletic Foundation, Inc.',
    locale: 'en_US',
    images: [
      {
        url: '/img/cesafi-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'CESAFI | Cebu Schools Athletic Foundation, Inc. Banner'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CESAFI | Cebu Schools Athletic Foundation, Inc.',
    description:
      'The official digital platform for Cebu Schools Athletic Foundation, Inc. (CESAFI). Get real-time updates, scores, news, schedules, standings, and team profiles for Cebuano collegiate athletics and education.', // Updated Twitter description
    images: ['/img/cesafi-banner.jpg']
  },
  alternates: {
    canonical: `${metadataBase}`
  },
  robots: {
    index: true,
    follow: true
  },
  applicationName: 'CESAFI Sports Website',
  category: 'Sports'
};
