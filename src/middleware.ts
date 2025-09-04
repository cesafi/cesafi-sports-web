import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    // FIX: dunno what happens here but i cant access any page with this
    // try {
    //     const response = await updateSession(request);
    //
    //     response.headers.set('X-Content-Type-Options', 'nosniff');
    //     response.headers.set('X-Frame-Options', 'DENY');
    //     response.headers.set('X-XSS-Protection', '1; mode=block');
    //     response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    //     response.headers.set(
    //         'Permissions-Policy',
    //         'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    //     );
    //
    //     if (process.env.NODE_ENV === 'production') {
    //         response.headers.set(
    //             'Content-Security-Policy',
    //             "default-src 'self'; \
    //      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.cloudflareinsights.com static.cloudflareinsights.com; \
    //      style-src 'self' 'unsafe-inline'; \
    //      img-src 'self' data: blob: *.supabase.co *.googleapis.com *.gstatic.com *.cloudflareinsights.com; \
    //      font-src 'self' data:; \
    //      connect-src 'self' *.supabase.co wss://*.supabase.co *.cloudflareinsights.com; \
    //      frame-src 'self' *.google.com *.googleapis.com; \
    //      worker-src 'self' blob:;"
    //         );
    //     }
    //
    //     return response;
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // } catch (_) {
    //     if (process.env.NODE_ENV === 'production') {
    //         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
    //             status: 500,
    //             headers: { 'Content-Type': 'application/json' }
    //         });
    //     }
    //
    //     return NextResponse.next();
    // }
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * - videos - .mp4, .webm, .ogg
         * - public static assets folder
         */
        '/((?!_next/static|_next/image|favicon.ico|videos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg)$).*)'
    ]
};
