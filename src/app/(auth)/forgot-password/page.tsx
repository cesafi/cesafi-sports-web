'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, User, AlertTriangle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForgotPassword } from '@/hooks/use-auth';
import { ForgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { ZodError } from 'zod';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useForgotPassword();

  const handleInputChange = (field: keyof ForgotPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      ForgotPasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<ForgotPasswordFormData> = {};
        error.issues.forEach((err) => {
          if (err.path && err.path[0]) {
            const field = err.path[0] as keyof ForgotPasswordFormData;
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
      await forgotPasswordMutation.mutateAsync(formData);
      setIsSubmitted(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const isLoading = forgotPasswordMutation.isPending;

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border border-gray-200 bg-white shadow-xl">
            <CardContent className="p-8">
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">Check your email</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    We&apos;ve sent a password reset link to <strong>{formData.email}</strong>
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Didn&apos;t receive the email? Check your spam folder or</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-[#4a7c59] hover:text-[#3a6b4a] font-medium"
                  >
                    try again
                  </button>
                </div>
                <div className="pt-4">
                  <Link 
                    href="/login" 
                    className="text-sm text-[#4a7c59] hover:text-[#3a6b4a] transition-colors"
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="border border-gray-200 bg-white shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <User className="h-5 w-5" />
                  <h2 className="text-xl font-medium">Forgot Password</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Enter your email address and we&apos;ll send you a link to reset your password
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
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
                    <div className="space-x-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-md font-medium text-white"
                  style={{ backgroundColor: '#4a7c59' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="flex items-start space-x-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                <p className="text-xs leading-relaxed text-gray-700">
                  For security reasons, we&apos;ll only send password reset emails to verified email addresses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center space-x-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
