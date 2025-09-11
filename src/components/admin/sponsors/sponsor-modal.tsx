'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sponsor, SponsorInsert, SponsorUpdate } from '@/lib/types/sponsors';
import { createSponsorSchema, updateSponsorSchema } from '@/lib/validations/sponsors';
import { ZodError } from 'zod';
import { useCloudinary } from '@/hooks/use-cloudinary';
import { ImageIcon, Upload, X, Loader2, Building2, Power } from 'lucide-react';
import Image from 'next/image';

interface SponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  sponsor?: Sponsor | null;
  onSubmit: (data: SponsorInsert | SponsorUpdate) => void;
  isLoading?: boolean;
}

export function SponsorModal({
  open,
  onOpenChange,
  mode,
  sponsor,
  onSubmit,
  isLoading = false
}: SponsorModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    logo_url: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, isUploading } = useCloudinary();

  // Reset form when modal opens/closes or sponsor changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && sponsor) {
        setFormData({
          title: sponsor.title || '',
          tagline: sponsor.tagline || '',
          logo_url: sponsor.logo_url || '',
          is_active: sponsor.is_active ?? true
        });
      } else {
        setFormData({
          title: '',
          tagline: '',
          logo_url: '',
          is_active: true
        });
      }
      setErrors({});
    }
  }, [open, mode, sponsor]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const sponsorName = formData.title || 'sponsor';
      const sanitizedName = sponsorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const publicId = `sponsors/logos/${sanitizedName}-${Date.now()}`;

      // Upload to Cloudinary
      const result = await uploadImage(file, {
        folder: 'sponsors/logos',
        public_id: publicId
      });

      if (result.success && result.data) {
        handleInputChange('logo_url', result.data.secure_url);
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
    }
  }, [uploadImage, formData.title]);

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'add') {
        const validatedData = createSponsorSchema.parse(formData);
        onSubmit(validatedData);
      } else {
        const validatedData = updateSponsorSchema.parse({
          id: sponsor?.id,
          ...formData
        });
        onSubmit(validatedData);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const removeLogo = async () => {
    // If there's a current logo, we should delete it from Cloudinary
    if (formData.logo_url) {
      try {
        // Extract public_id from the URL for deletion
        const url = formData.logo_url;
        // Match the full path after /upload/ or /upload/vX_Y_Z/ and remove extension
        const publicIdMatch = url.match(/\/upload\/(?:v\d+_\d+_\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i);

        if (publicIdMatch) {
          const publicId = publicIdMatch[1]; // This includes the full folder path without extension

          await deleteImage(publicId);
        }
      } catch (error) {
        // Don't block the UI removal if deletion fails
        console.warn('Failed to delete image from Cloudinary:', error);
      }
    }
    
    handleInputChange('logo_url', '');
  };

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Add New Sponsor' : 'Edit Sponsor'}
      maxWidth="max-w-2xl"
      height="h-[700px]"
      footer={
        <div className="flex gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="flex-1" disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'add' ? 'Create Sponsor' : 'Update Sponsor'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sponsor Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter sponsor title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline *</Label>
              <Textarea
                id="tagline"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Enter sponsor tagline or description"
                className={errors.tagline ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.tagline && <p className="text-sm text-red-500">{errors.tagline}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Sponsor Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.logo_url ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed border-border">
                    {formData.logo_url && (
                      <img
                        src={formData.logo_url}
                        alt="Sponsor logo"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Logo</p>
                    <p className="text-muted-foreground truncate text-xs">{formData.logo_url}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                    className="text-red-600 hover:border-red-300 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Change Logo
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className={`h-32 w-full rounded-lg border-2 border-dashed transition-colors duration-200 ${
                    isDragOver
                      ? 'border-primary bg-primary/10'
                      : errors.logo_url
                      ? 'border-red-500 hover:border-red-400'
                      : 'border-border hover:border-muted-foreground'
                  } flex flex-col items-center justify-center`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImageIcon
                    className={`mb-2 h-8 w-8 transition-colors duration-200 ${
                      isDragOver ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <p
                    className={`mb-2 text-sm transition-colors duration-200 ${
                      isDragOver ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {isDragOver ? 'Drop your logo here' : 'Upload sponsor logo'}
                  </p>
                  <p className="text-center text-xs text-muted-foreground">PNG, JPG, or WebP up to 5MB</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {errors.logo_url && <p className="text-sm text-red-500">{errors.logo_url}</p>}
            <p className="text-muted-foreground text-xs">
              Logo will be automatically optimized and stored in the cloud. Recommended size:
              200x200px or larger.
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
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
              <Label htmlFor="is_active">Active Sponsor</Label>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Active sponsors are visible on the platform and can be featured in events.
            </p>
          </CardContent>
        </Card>
      </form>
    </ModalLayout>
  );
}
