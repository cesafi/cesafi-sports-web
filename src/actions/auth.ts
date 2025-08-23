'use server';

import { AuthService } from '@/services/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAction(email: string, password: string) {
  const result = await AuthService.login(email, password);

  if (result.success) {
    revalidatePath('/');
    // The middleware will handle redirecting to the appropriate dashboard
    redirect('/');
  }

  return result;
}

export async function logoutAction() {
  const result = await AuthService.logout();

  if (result.success) {
    revalidatePath('/');
    redirect('/login');
  }

  return result;
}



export async function checkAuthAction(requiredRoles: string[] = []) {
  return await AuthService.checkAuth(requiredRoles);
}
