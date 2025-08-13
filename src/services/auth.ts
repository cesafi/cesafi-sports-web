import { ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { AuthCheckResult } from '@/lib/types/auth';

const WEBSITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export class AuthService extends BaseService {
  static async login(email: string, password: string): Promise<ServiceResponse<undefined>> {
    if (!email || !password) {
      return { success: false, error: 'Email or Password is missing.' };
    }

    try {
      const supabase = await this.getClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.session || !data.user) {
        return {
          success: false,
          error:
            'Login successful, but no active session found. Please check your email for verification if required.'
        };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to login');
    }
  }

  static async logout(): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to log out');
    }
  }

  static async forgotPassword(email: string): Promise<ServiceResponse<undefined>> {
    if (!email) {
      return { success: false, error: 'Email is required for password reset.' };
    }

    try {
      const supabase = await this.getClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${WEBSITE_URL}/update-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to initiate password reset');
    }
  }

  static async checkAuth(requiredRoles: string[] = []): Promise<AuthCheckResult> {
    try {
      const supabase = await this.getClient();

      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          authenticated: false,
          authorized: false,
          error: error?.message || 'Authentication required to perform this action.'
        };
      }

      const userRoles: string[] = (user.user_metadata?.roles as string[] | undefined) || [];

      if (requiredRoles.length === 0) {
        return {
          authenticated: true,
          authorized: true,
          userRoles: userRoles
        };
      }

      const isAuthorized = requiredRoles.some((role) => userRoles.includes(role));

      if (!isAuthorized) {
        return {
          authenticated: true,
          authorized: false,
          error: 'You do not have the required permissions to perform this action.',
          userRoles: userRoles
        };
      }

      return {
        authenticated: true,
        authorized: true,
        userRoles: userRoles
      };
    } catch (error) {
      return {
        authenticated: false,
        authorized: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during authentication check.'
      };
    }
  }
}
