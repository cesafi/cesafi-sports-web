import { useMutation, useQuery } from '@tanstack/react-query';
import { loginAction, logoutAction, checkAuthAction } from '@/actions/auth';
import { LoginFormData } from '@/lib/validations/auth';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginFormData) => loginAction(email, password),
    onError: (error: Error) => {
      if (error.message !== 'NEXT_REDIRECT') {
        console.error('Login error:', error);
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        console.log('Login successful:', result);
      }
    }
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutAction,
    onError: (error: Error) => {
      if (error.message !== 'NEXT_REDIRECT') {
        console.error('Logout error:', error);
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        console.log('Logout successful');
      }
    }
  });
}

export function useCheckAuth(requiredRoles: string[] = []) {
  return useQuery({
    queryKey: ['auth', 'check', requiredRoles],
    queryFn: () => checkAuthAction(requiredRoles),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      const supabase = await import('@/lib/supabase/client').then((m) => m.createClient());
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.log('useCurrentUser: No user found or error:', error);
        return null;
      }

      const userData = {
        id: user.id,
        email: user.email,
        userRole: user.app_metadata?.role as string | undefined,
        userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      };

      console.log('useCurrentUser: User data retrieved:', userData);
      return userData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}
