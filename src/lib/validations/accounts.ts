import { z } from 'zod';

// Schema for creating new accounts
export const createAccountSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['admin', 'head_writer', 'league_operator', 'writer'] as const)
});

// Schema for updating account roles
export const updateAccountRoleSchema = z.object({
  role: z.enum(['admin', 'head_writer', 'league_operator', 'writer'] as const)
});

// Schema for resetting passwords
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Schema for updating account information
export const updateAccountSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().optional().refine((val) => {
    // If password is provided, it must meet requirements
    if (val && val.trim() !== '') {
      return val.length >= 8 &&
        /[a-z]/.test(val) &&
        /[A-Z]/.test(val) &&
        /[0-9]/.test(val) &&
        /[^a-zA-Z0-9]/.test(val);
    }
    // Empty password is allowed (will not update)
    return true;
  }, 'Password must be at least 8 characters long and contain lowercase, uppercase, numbers, and special characters'),
  role: z.enum(['admin', 'head_writer', 'league_operator', 'writer'] as const)
});

// Type exports
export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
export type UpdateAccountRoleFormData = z.infer<typeof updateAccountRoleSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
