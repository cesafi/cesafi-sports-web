'use client';

import { useState } from 'react';
import { User, Mail, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalLayout } from '@/components/ui/modal-layout';
import { useAccounts } from '@/hooks/use-accounts';
import { CreateAccountFormData, createAccountSchema } from '@/lib/validations/accounts';
import { toast } from 'sonner';
import { generateSecurePasswordAction } from '@/actions/accounts';
import { z } from 'zod';
import { USER_ROLES } from '@/lib/utils/roles';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    displayName: '',
    email: '',
    password: '',
    role: 'writer'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  const { createAccount } = useAccounts();

  const validateForm = () => {
    try {
      createAccountSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await createAccount(formData);
      if (success) {
        handleClose();
        toast.success('Account created successfully');
      }
    } catch {
      toast.error('Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      displayName: '',
      email: '',
      password: '',
      role: 'writer'
    });
    setErrors({});
    onClose();
  };

  const generateSecurePassword = async () => {
    setIsGeneratingPassword(true);
    try {
      const result = await generateSecurePasswordAction();
      
      if (result.success && result.data) {
        setFormData(prev => ({ ...prev, password: result.data }));
        toast.success('Secure password generated successfully');
      } else {
        toast.error(result.error || 'Failed to generate password');
      }
    } catch {
      toast.error('Failed to generate secure password');
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  return (
    <ModalLayout
      open={isOpen}
      onOpenChange={handleClose}
      title="Add New Account"
      maxWidth="max-w-2xl"
      height="h-[600px]"
      footer={
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name *</label>
              <Input
                value={formData.displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Enter display name"
                className={errors.displayName ? 'border-red-500' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password *</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generateSecurePassword}
                  className="whitespace-nowrap"
                  disabled={isGeneratingPassword}
                >
                  {isGeneratingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
                             <p className="text-xs text-muted-foreground">
                 Password must be at least 8 characters long and contain lowercase, uppercase, numbers, and special characters
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {USER_ROLES.map((role) => (
                <div
                  key={role.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.role === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                >
                  <div className="font-medium">{role.label}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </form>
    </ModalLayout>
  );
}
