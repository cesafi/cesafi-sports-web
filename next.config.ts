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
      script-src 'self' 'unsafe-inline' 'unsafe-eval' fonts.googleapis.com static.cloudflareinsights.com https://challenges.cloudflare.com vercel.live;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' data: blob: rqwvkzpkhynfyabvfqmu.supabase.co fonts.gstatic.com static.cloudflareinsights.com *.cloudinary.com;
      font-src 'self' data: fonts.gstatic.com;
      connect-src 'self' rqwvkzpkhynfyabvfqmu.supabase.co wss://rqwvkzpkhynfyabvfqmu.supabase.co static.cloudflareinsights.com https://api.cloudinary.com https://challenges.cloudflare.com vercel.live;
      frame-src 'self' www.youtube.com https://challenges.cloudflare.com vercel.live;
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
      // Cloudinary CDN
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
