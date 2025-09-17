'use server';

import { AuthService } from '@/services/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { isRateLimited, recordLoginAttempt, getClientIP } from '@/lib/utils/rate-limit';

export async function loginAction(email: string, password: string, turnstileToken?: string) {
  // Get client IP for rate limiting
  const headersList = await headers();
  const request = new Request('http://localhost', { headers: headersList });
  const clientIP = getClientIP(request);
  
  // Check rate limit before attempting login
  const rateLimitCheck = isRateLimited(clientIP, email);
  
  if (rateLimitCheck.limited) {
    const resetTime = rateLimitCheck.resetTime;
    const waitMinutes = resetTime ? Math.ceil((resetTime - Date.now()) / (1000 * 60)) : 30;
    
    return {
      success: false,
      error: `Too many failed login attempts. Please try again in ${waitMinutes} minutes.`,
      rateLimited: true,
      resetTime
    };
  }
  
  // Attempt login
  const result = await AuthService.login(email, password, turnstileToken);
  
  // Record the attempt for rate limiting
  recordLoginAttempt(clientIP, email, result.success);
  
  if (result.success) {
    revalidatePath('/');
    return result;
  }

  // Add remaining attempts info to failed login response
  const updatedRateLimit = isRateLimited(clientIP, email);
  return {
    ...result,
    remainingAttempts: updatedRateLimit.remainingAttempts
  };
}

export async function logoutAction() {
  const result = await AuthService.logout();

  if (result.success) {
    revalidatePath('/');
    // Return success result - let the client handle the redirect
    // The client can navigate to login page after successful logout
    return result;
  }

  return result;
}

export async function checkAuthAction(requiredRoles: string[] = []) {
  return await AuthService.checkAuth(requiredRoles);
}

export async function getCurrentUserAction() {
  try {
    const { getSupabaseServer } = await import('@/lib/supabase/server');
    const supabase = await getSupabaseServer();
    
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const userData = {
      id: user.id,
      email: user.email,
      userRole: user.app_metadata?.role as string | undefined,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    };

    return { success: true, data: userData };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user data' 
    };
  }
}
