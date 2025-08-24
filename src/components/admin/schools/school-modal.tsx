'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { School, SchoolInsert, SchoolUpdate } from '@/lib/types/schools';
import { createSchoolSchema, updateSchoolSchema } from '@/lib/validations/schools';
import { ZodError } from 'zod';
import { Building2, Hash, Image, Power, Upload, X } from 'lucide-react';

interface SchoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  school?: School;
  onSubmit: (data: SchoolInsert | SchoolUpdate) => Promise<void>;
  isSubmitting: boolean;
}

export function SchoolModal({
  open,
  onOpenChange,
  mode,
  school,
  onSubmit,
  isSubmitting
}: SchoolModalProps) {
  const [formData, setFormData] = useState<SchoolInsert | SchoolUpdate>({
    name: '',
    abbreviation: '',
    logo_url: '',
    is_active: true
  } as SchoolInsert | SchoolUpdate);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasStartedCreating, setHasStartedCreating] = useState(false);
  const [hasStartedUpdating, setHasStartedUpdating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && school) {
        setFormData({
          name: school.name || '',
          abbreviation: school.abbreviation || '',
          logo_url: school.logo_url || '',
          is_active: school.is_active ?? true
        });
      } else {
        setFormData({
          name: '',
          abbreviation: '',
          logo_url: '',
          is_active: true
        });
      }
      setErrors({});
      setHasStartedCreating(false);
      setHasStartedUpdating(false);
    }
  }, [open, mode, school]);

  // Handle form submission completion
  useEffect(() => {
    if (hasStartedCreating && !isSubmitting && mode === 'add') {
      handleClose();
    }
  }, [isSubmitting, mode, hasStartedCreating, handleClose]);

  useEffect(() => {
    if (hasStartedUpdating && !isSubmitting && mode === 'edit') {
      handleClose();
    }
  }, [isSubmitting, mode, hasStartedUpdating, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = mode === 'add' ? createSchoolSchema : updateSchoolSchema;
      const validatedData = schema.parse(formData);

      if (mode === 'add') {
        setHasStartedCreating(true);
      } else {
        setHasStartedUpdating(true);
      }

      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (file: File) => {
    // TODO: Implement Cloudinary upload
    // For now, just show a placeholder message
    toast.info('Logo upload functionality will be implemented with Cloudinary integration');
    
    // Simulate getting a URL (remove this when implementing actual upload)
    const mockUrl = `https://example.com/logo-${Date.now()}.jpg`;
    handleInputChange('logo_url', mockUrl);
  };

  const removeLogo = () => {
    handleInputChange('logo_url', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleLogoUpload(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Add New School' : 'Edit School'}
      maxWidth="max-w-2xl"
      height="h-[700px]"
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
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Saving...'
            ) : mode === 'add' ? (
              'Create School'
            ) : (
              'Update School'
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter school name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abbreviation *</Label>
              <Input
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                placeholder="e.g., USC, CIT-U"
                className={errors.abbreviation ? 'border-red-500' : ''}
              />
              {errors.abbreviation && <p className="text-sm text-red-500">{errors.abbreviation}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5" />
              School Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.logo_url ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    <img 
                      src={formData.logo_url} 
                      alt="School logo" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Logo</p>
                    <p className="text-xs text-muted-foreground truncate">{formData.logo_url}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Logo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div 
                  className={`h-32 w-full rounded-lg border-2 border-dashed transition-colors duration-200 ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  } flex flex-col items-center justify-center`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Image className={`h-8 w-8 mb-2 transition-colors duration-200 ${
                    isDragOver ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm mb-2 transition-colors duration-200 ${
                    isDragOver ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {isDragOver ? 'Drop your logo here' : 'Upload school logo'}
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    PNG, JPG, or WebP up to 5MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleLogoUpload(file);
                }
              }}
            />
            
            <p className="text-xs text-muted-foreground">
              Logo will be automatically optimized and stored in the cloud. Recommended size: 200x200px or larger.
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Power className="h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active School</Label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active schools are visible in the system and can participate in events.
            </p>
          </CardContent>
        </Card>
      </form>
    </ModalLayout>
  );
}
