'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModalLayout } from '@/components/ui/modal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Volunteer, VolunteerInsert, VolunteerUpdate } from '@/lib/types/volunteers';
import { createVolunteerSchema, updateVolunteerSchema } from '@/lib/validations/volunteers';
import { ZodError } from 'zod';
import { useSeason } from '@/components/contexts/season-provider';
import { useAllDepartments } from '@/hooks/use-departments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCloudinary } from '@/hooks/use-cloudinary';

interface VolunteersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  volunteer?: Volunteer;
  onSubmit: (data: VolunteerInsert | VolunteerUpdate) => Promise<void>;
  isSubmitting: boolean;
  onSuccess?: () => void; // Callback to trigger refetch
}

export function VolunteersModal({
  open,
  onOpenChange,
  mode,
  volunteer,
  onSubmit,
  isSubmitting,
  onSuccess
}: VolunteersModalProps) {
  const { currentSeason } = useSeason();
  const { data: departments } = useAllDepartments();

  // State management
  const [formData, setFormData] = useState<VolunteerInsert | VolunteerUpdate>({
    full_name: '',
    image_url: '',
    is_active: true,
    department_id: null,
    season_id: currentSeason?.id || null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null); // Track old image for cleanup
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  // Cloudinary hook
  const { uploadImage, deleteImage, isUploading } = useCloudinary();

  // Form reset on modal open/close
  useEffect(() => {
    if (open) {
      // Reset form data based on mode
      if (mode === 'edit' && volunteer) {
        setFormData({
          id: volunteer.id,
          full_name: volunteer.full_name,
          image_url: volunteer.image_url || '',
          is_active: volunteer.is_active || true,
          department_id: volunteer.department_id,
          season_id: volunteer.season_id || currentSeason?.id || null
        });
        setOldImageUrl(volunteer.image_url); // Track the original image for cleanup
      } else {
        setFormData({
          full_name: '',
          image_url: '',
          is_active: true,
          department_id: null,
          season_id: currentSeason?.id || null
        });
        setOldImageUrl(null);
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, volunteer, currentSeason]);

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Update season_id when currentSeason changes
  useEffect(() => {
    if (currentSeason?.id && mode === 'add') {
      setFormData((prev) => ({ ...prev, season_id: currentSeason.id }));
    }
  }, [currentSeason, mode]);

  // Track when mutations start
  useEffect(() => {
    if (isSubmitting && mode === 'add' && !hasStartedCreating.current) {
      hasStartedCreating.current = true;
    }
    if (isSubmitting && mode === 'edit' && !hasStartedUpdating.current) {
      hasStartedUpdating.current = true;
    }
  }, [isSubmitting, mode]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      hasStartedCreating.current = false;
      onSuccess?.();
      handleClose();
    }
  }, [handleClose, isSubmitting, mode, onSuccess]);

  const cleanupOldImage = useCallback(async (imageUrl: string) => {
    try {
      // Extract public_id from the URL for deletion (same pattern as the service)
      const url = imageUrl;
      // Match the full path after /upload/ or /upload/vX_Y_Z/ and remove extension
      const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i);
      
      if (publicIdMatch) {
        const publicId = publicIdMatch[1]; // This includes the full folder path without extension
        
        await deleteImage(publicId);
      }
    } catch (error) {
      // Don't block the process if cleanup fails
      console.warn('Failed to cleanup old volunteer image from Cloudinary:', error);
    }
  }, [deleteImage]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      hasStartedUpdating.current = false;
      
      // Clean up old image if a new one was uploaded
      if (oldImageUrl && formData.image_url && oldImageUrl !== formData.image_url) {
        cleanupOldImage(oldImageUrl);
      }
      
      onSuccess?.();
      handleClose();
    }
  }, [handleClose, isSubmitting, mode, oldImageUrl, formData.image_url, deleteImage, onSuccess, cleanupOldImage]);


  const handleInputChange = (field: string, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      // Generate a unique filename for the volunteer image
      const volunteerName = formData.full_name || 'volunteer';
      const sanitizedName = volunteerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${sanitizedName}-${Date.now()}`;

      // Upload to Cloudinary
      const result = await uploadImage(file, {
        folder: 'volunteers/images',
        public_id: filename  // Just the filename, folder will be prepended automatically
      });

      if (result.success && result.data) {
        // If updating and there was an old image, mark it for cleanup after successful save
        if (mode === 'edit' && oldImageUrl && oldImageUrl !== result.data.secure_url) {
          // We'll cleanup the old image after the volunteer update is successful
          // This will be handled in the submission success logic
        }

        handleInputChange('image_url', result.data.secure_url);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const removeImage = async () => {
    // If there's a current image, we should delete it from Cloudinary
    if (formData.image_url) {
      try {
        // Extract public_id from the URL for deletion (same pattern as the service)
        const url = formData.image_url;
        // Match the full path after /upload/ or /upload/vX_Y_Z/ and remove extension
        const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i);
        
        if (publicIdMatch) {
          const publicId = publicIdMatch[1]; // This includes the full folder path without extension
          
          await deleteImage(publicId);
        }
      } catch (error) {
        // Don't block the UI removal if deletion fails
        console.warn('Failed to delete image from Cloudinary:', error);
      }
    }
    
    handleInputChange('image_url', '');
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
        handleImageUpload(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = mode === 'add' ? createVolunteerSchema : updateVolunteerSchema;
      const validatedData = schema.parse(formData);

      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
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

  return (
    <ModalLayout
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? 'Add New Volunteer' : 'Edit Volunteer'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="volunteer-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Volunteer' : 'Update Volunteer'}
          </Button>
        </div>
      }
    >
      <form id="volunteer-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter volunteer's full name"
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={formData.department_id?.toString() || 'none'}
                onValueChange={(value) =>
                  handleInputChange('department_id', value === 'none' ? null : parseInt(value))
                }
              >
                <SelectTrigger
                  id="department_id"
                  className={errors.department_id ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select a department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Department</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Volunteer Photo *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.image_url ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed border-border">
                    <Image
                      src={formData.image_url}
                      alt="Volunteer photo"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Photo</p>
                    <p className="text-muted-foreground truncate text-xs">{formData.image_url}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="text-red-600 hover:border-red-300 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
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
                      Change Photo
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
                      : errors.image_url
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
                    {isDragOver ? 'Drop your photo here' : 'Upload volunteer photo'}
                  </p>
                  <p className="text-center text-xs text-muted-foreground">PNG, JPG, or WebP up to 5MB</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
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
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
            />

            {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
            <p className="text-muted-foreground text-xs">
              Photo will be automatically optimized and stored in the cloud. Required for all volunteers.
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
                checked={formData.is_active || false}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active Volunteer</Label>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Active volunteers are visible in the system and can be assigned to events.
            </p>

            {/* Season ID (hidden, auto-filled) */}
            <input type="hidden" value={formData.season_id || ''} />

            {currentSeason && (
              <div className="text-muted-foreground text-sm mt-2">
                This volunteer will be assigned to Season {currentSeason.id}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </ModalLayout>
  );
}
