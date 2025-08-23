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
      img-src 'self' data: blob: *.supabase.co *.googleapis.com *.gstatic.com *.cloudflareinsights.com;
      font-src 'self' data:;
      connect-src 'self' *.supabase.co wss://*.supabase.co *.cloudflareinsights.com;
      frame-src 'self' *.google.com *.googleapis.com;
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
