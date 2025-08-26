import { ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { UserRole } from '@/lib/types/auth';

export interface CreateAccountData {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}

import { BaseEntity } from '@/lib/types/table';

export interface AccountEntity extends BaseEntity {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: string;
  lastSignInAt?: string;
}

export type AccountData = AccountEntity;

export class AccountsService extends BaseService {
  static async createAccount(
    accountData: CreateAccountData
  ): Promise<ServiceResponse<AccountData>> {
    try {
      const supabase = await this.getAdminClient();

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: accountData.email,
        password: accountData.password,
        email_confirm: true,
        user_metadata: {
          display_name: accountData.displayName
        },
        app_metadata: {
          role: accountData.role
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      const account: AccountData = {
        id: authData.user.id,
        email: authData.user.email!,
        role: accountData.role,
        displayName: accountData.displayName,
        createdAt: authData.user.created_at,
        lastSignInAt: authData.user.last_sign_in_at
      };

      return { success: true, data: account };
    } catch (error) {
      return this.formatError(error, 'Failed to create account');
    }
  }

  static async getAllAccounts(): Promise<ServiceResponse<AccountData[]>> {
    try {
      const supabase = await this.getAdminClient();

      const { data: users, error } = await supabase.auth.admin.listUsers();

      if (error) {
        return { success: false, error: error.message };
      }

      const accounts: AccountData[] = users.users.map((user) => ({
        id: user.id,
        email: user.email || '',
        role: (user.app_metadata?.role as UserRole) || 'writer',
        displayName:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.displayName ||
          user.user_metadata?.name,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at
      }));

      return { success: true, data: accounts };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch accounts');
    }
  }

  static async updateAccountRole(
    userId: string,
    newRole: UserRole
  ): Promise<ServiceResponse<AccountData>> {
    try {
      const supabase = await this.getAdminClient();

      const { data: user, error } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { role: newRole }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!user.user) {
        return { success: false, error: 'Failed to update user role' };
      }

      const account: AccountData = {
        id: user.user.id,
        email: user.user.email!,
        role: newRole,
        displayName: user.user.user_metadata?.display_name,
        createdAt: user.user.created_at,
        lastSignInAt: user.user.last_sign_in_at
      };

      return { success: true, data: account };
    } catch (error) {
      return this.formatError(error, 'Failed to update account role');
    }
  }

  static async updateAccount(
    userId: string,
    updates: { displayName?: string; role?: UserRole; password?: string }
  ): Promise<ServiceResponse<AccountData>> {
    try {
      const supabase = await this.getAdminClient();

      const updateData: {
        user_metadata?: { display_name?: string };
        app_metadata?: { role?: UserRole };
        password?: string;
      } = {};

      // Update user metadata for display name
      if (updates.displayName !== undefined) {
        updateData.user_metadata = { display_name: updates.displayName };
      }

      // Update app metadata for role
      if (updates.role !== undefined) {
        updateData.app_metadata = { role: updates.role };
      }

      // Update password if provided
      if (updates.password !== undefined) {
        updateData.password = updates.password;
      }

      const { data: user, error } = await supabase.auth.admin.updateUserById(userId, updateData);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!user.user) {
        return { success: false, error: 'Failed to update user' };
      }

      const account: AccountData = {
        id: user.user.id,
        email: user.user.email!,
        role: (user.user.app_metadata?.role as UserRole) || 'writer',
        displayName: user.user.user_metadata?.display_name,
        createdAt: user.user.created_at,
        lastSignInAt: user.user.last_sign_in_at
      };

      return { success: true, data: account };
    } catch (error) {
      return this.formatError(error, 'Failed to update account');
    }
  }

  static async resetPassword(
    userId: string,
    newPassword: string
  ): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getAdminClient();

      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to reset password');
    }
  }

  static async deleteAccount(userId: string): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getAdminClient();

      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to delete account');
    }
  }
}
