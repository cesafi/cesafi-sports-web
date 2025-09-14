import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.cloudflareinsights.com static.cloudflareinsights.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: *.supabase.co *.googleapis.com *.gstatic.com *.cloudflareinsights.com *.cloudinary.com cdn.manilastandard.net images.unsplash.com via.placeholder.com picsum.photos source.unsplash.com *.googleusercontent.com sports.inquirer.net newsinfo.inquirer.net cebudailynews.inquirer.net www.sunstar.com.ph www.thefreeman.net cebunews.net www.philstar.com www.gmanetwork.com www.abs-cbn.com www.rappler.com;
      font-src 'self' data:;
      connect-src 'self' *.supabase.co wss://*.supabase.co *.cloudflareinsights.com https://api.cloudinary.com;
      frame-src 'self' *.google.com *.googleapis.com *.youtube.com;
      worker-src 'self' blob:;
    `
      .replace(/\s{2,}/g, ' ')
      .trim()
  }
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rqwvkzpkhynfyabvfqmu.supabase.co',
        port: '',
        pathname: '/**'
      },
      // GNews image CDNs
      {
        protocol: 'https',
        hostname: 'cdn.manilastandard.net',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**'
      },
      // Philippine news outlets
      {
        protocol: 'https',
        hostname: 'sports.inquirer.net',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'newsinfo.inquirer.net',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cebudailynews.inquirer.net',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.sunstar.com.ph',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.thefreeman.net',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cebunews.net',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.philstar.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.gmanetwork.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.abs-cbn.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.rappler.com',
        port: '',
        pathname: '/**'
      },
      // Cloudinary CDN
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**'
      },
      // Common news site CDNs
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
