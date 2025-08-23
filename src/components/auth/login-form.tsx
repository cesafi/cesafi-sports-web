'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth';
import { LoginSchema, type LoginFormData } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { ZodError } from 'zod';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const loginMutation = useLogin();

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      LoginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<LoginFormData> = {};
        error.issues.forEach((err) => {
          if (err.path && err.path[0]) {
            const field = err.path[0] as keyof LoginFormData;
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync(formData);
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="sample@cesafi.org"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`h-12 rounded-md border-gray-300 pl-10 focus:border-[#4a7c59] focus:ring-[#4a7c59] ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
            />
          </div>
          {errors.email && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`h-12 rounded-md border-gray-300 pr-10 pl-10 focus:border-[#4a7c59] focus:ring-[#4a7c59] ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="bg-primary text-primary-foreground h-12 w-full rounded-md font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In to Portal'}
        </Button>
      </form>
    </div>
  );
}
