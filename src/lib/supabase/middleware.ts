import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '../../../database.types';
import { type NextRequest, NextResponse } from 'next/server';

type UserRole = Database['public']['Enums']['user_roles'];

const publicRoutes = [
  '/',
  '/favicon.ico',
  '/_next/public',
  '/sitemap.xml',
  '/robots.txt',
  '/login',
  '/forgot-password',
  '/test-cloudinary',
  '/schedule'
];

const roleDashboards: Record<UserRole, string> = {
  admin: '/admin',
  head_writer: '/head-writer',
  league_operator: '/league-operator',
  writer: '/writer'
};

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  try {
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

            response = NextResponse.next({ request });

            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, { ...cookieOptions, ...options })
            );
          }
        }
      }
    );

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (process.env.NODE_ENV === 'development') {
      console.log('[middleware.ts]: User check result:', {
        hasUser: !!user,
        userEmail: user?.email,
        userRole: user?.app_metadata?.role,
        error: userError?.message
      });
    }

    const url = request.nextUrl.pathname;

    const isProtectedRoute = !publicRoutes.some(
      (route) => url === route || url.startsWith(route + '/')
    );

    if (isProtectedRoute && (userError || !user)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user) {
      const role = user.app_metadata?.role as UserRole | undefined;
      const isAtLoginPage = url === '/login';

      if (url === '/' || isAtLoginPage) {
        if (role && role in roleDashboards) {
          return NextResponse.redirect(new URL(roleDashboards[role], request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return response;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return response;
  }
};
