import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '../../../database.types';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, { ...cookieOptions, ...options })
            );
          }
        }
      }
    );

    const { error: userError } = await supabase.auth.getUser();
    const url = request.nextUrl.pathname;

    const publicRoutes = [
      '/',
      '/favicon.ico',
      '/_next/public',
      '/sitemap.xml',
      '/robots.txt',
      '/login',
      '/forgot-password',
      '/test-cloudinary'
    ];

    const isProtectedRoute = !publicRoutes.some(
      (route) => url === route || url.startsWith(route + '/')
    );

    if (isProtectedRoute && userError) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!userError) {
      const isAtLoginPage = url === '/login';
      if (url === '/' || isAtLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return response;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    const errorResponse = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    errorResponse.headers.set('X-Content-Type-Options', 'nosniff');
    errorResponse.headers.set('X-Frame-Options', 'DENY');
    errorResponse.headers.set('X-XSS-Protection', '1; mode=block');
    errorResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    errorResponse.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    return errorResponse;
  }
};
