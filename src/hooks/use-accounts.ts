'use client';

import { useState, useEffect } from 'react';
import { AccountData, CreateAccountData } from '@/services/accounts';
import { UpdateAccountFormData } from '@/lib/validations/accounts';
import { 
  getAllAccountsAction, 
  createAccountAction, 
  updateAccountAction,
  updateAccountRoleAction, 
  resetPasswordAction, 
  deleteAccountAction 
} from '@/actions/accounts';
import { toast } from 'sonner';

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllAccountsAction();
      
      if (result.success && 'data' in result && result.data) {
        setAccounts(result.data);
      } else {
        setError(result.error || 'Failed to fetch accounts');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (userId: string, accountData: UpdateAccountFormData) => {
    try {
      const result = await updateAccountAction(userId, accountData);
      
      if (result.success) {
        toast.success('Account updated successfully');
        await fetchAccounts(); // Refresh the list
        return true;
      } else {
        toast.error(result.error || 'Failed to update account');
        return false;
      }
    } catch {
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  const createAccount = async (accountData: CreateAccountData) => {
    try {
      const result = await createAccountAction(accountData);
      
      if (result.success) {
        toast.success('Account created successfully');
        await fetchAccounts(); // Refresh the list
        return true;
      } else {
        toast.error(result.error || 'Failed to create account');
        return false;
      }
    } catch {
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  const updateAccountRole = async (userId: string, newRole: string) => {
    try {
      const result = await updateAccountRoleAction(userId, newRole);
      
      if (result.success) {
        toast.success('Account role updated successfully');
        await fetchAccounts(); // Refresh the list
        return true;
      } else {
        toast.error(result.error || 'Failed to update account role');
        return false;
      }
    } catch {
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      const result = await resetPasswordAction(userId, newPassword);
      
      if (result.success) {
        toast.success('Password reset successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to reset password');
        return false;
      }
    } catch {
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  const deleteAccount = async (userId: string) => {
    try {
      const result = await deleteAccountAction(userId);
      
      if (result.success) {
        toast.success('Account deleted successfully');
        await fetchAccounts(); // Refresh the list
        return true;
      } else {
        toast.error(result.error || 'Failed to delete account');
        return false;
      }
    } catch {
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    updateAccountRole,
    resetPassword,
    deleteAccount
  };
}
