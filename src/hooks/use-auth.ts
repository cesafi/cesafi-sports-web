import { useMutation, useQuery } from '@tanstack/react-query';
import { loginAction, logoutAction, checkAuthAction } from '@/actions/auth';
import { LoginFormData } from '@/lib/validations/auth';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginFormData) => loginAction(email, password),
    onError: (error: Error) => {
      console.error('Login error:', error);
    }
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutAction,
    onError: (error: Error) => {
      console.error('Logout error:', error);
    }
  });
}



export function useCheckAuth(requiredRoles: string[] = []) {
  return useQuery({
    queryKey: ['auth', 'check', requiredRoles],
    queryFn: () => checkAuthAction(requiredRoles),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
