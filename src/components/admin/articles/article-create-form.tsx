'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, User, Image, Save } from 'lucide-react';
import { ArticleInsert } from '@/lib/types/articles';
import { toast } from 'sonner';
import CloudinaryService from '@/services/cloudinary';

interface ArticleCreateFormProps {
  onSubmit: (data: Partial<ArticleInsert>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<ArticleInsert>;
  compact?: boolean;
}

type ArticleStatus = 'review' | 'published' | 'revise' | 'cancelled' | 'approved';

const statusConfig = {
  review: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Article will be submitted for review'
  },
  approved: {
    label: 'Approved',
    color: 'bg-blue-100 text-blue-800',
    description: 'Article is approved for publication'
  },
  published: {
    label: 'Published',
    color: 'bg-green-100 text-green-800',
    description: 'Article will be published immediately'
  },
  revise: {
    label: 'Needs Revision',
    color: 'bg-orange-100 text-orange-800',
    description: 'Article needs changes before publication'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    description: 'Article is cancelled'
  }
};

export function ArticleCreateForm({ onSubmit, isSubmitting, initialData, compact = false }: ArticleCreateFormProps) {
  const [formData, setFormData] = useState<Partial<ArticleInsert>>({
    title: '',
    authored_by: '',
    cover_image_url: '',
    status: 'review'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ArticleInsert, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await CloudinaryService.uploadImage(file, {
        folder: 'articles/covers',
        transformation: {
          width: 1200,
          height: 630,
          crop: 'fill',
          quality: 'auto',
          format: 'auto'
        }
      });

      if (result.success && result.data) {
        setFormData(prev => ({ ...prev, cover_image_url: result.data!.secure_url }));
        toast.success('Cover image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.authored_by?.trim()) {
      newErrors.authored_by = 'Author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const currentStatus = statusConfig[formData.status as ArticleStatus] || statusConfig.review;

  if (compact) {
    return (
      <div className="h-full flex flex-col">
        {/* Compact Header */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Article Details</span>
          </h3>
        </div>

        {/* Compact Form */}
        <div className="flex-1 p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`text-sm ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter article title"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="authored_by" className="text-sm">Author *</Label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="authored_by"
                  value={formData.authored_by || ''}
                  onChange={(e) => handleInputChange('authored_by', e.target.value)}
                  className={`pl-8 text-sm ${errors.authored_by ? 'border-red-500' : ''}`}
                  placeholder="Enter author name"
                  disabled={isSubmitting}
                />
              </div>
              {errors.authored_by && (
                <p className="text-xs text-red-500">{errors.authored_by}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">Status</Label>
              <Select 
                value={formData.status || 'review'} 
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value} className="text-sm">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={`${currentStatus.color} text-xs`}>
                  {currentStatus.label}
                </Badge>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label className="text-sm">Cover Image</Label>
              
              {formData.cover_image_url && (
                <div className="relative w-full">
                  <img
                    src={formData.cover_image_url}
                    alt="Cover preview"
                    className="w-full h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
                    disabled={isSubmitting}
                  >
                    ×
                  </Button>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('cover-image-input')?.click()}
                disabled={isSubmitting || isUploadingImage}
                className="w-full text-xs"
              >
                {isUploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-2" />
                    {formData.cover_image_url ? 'Change Image' : 'Upload Image'}
                  </>
                )}
              </Button>
              <input
                id="cover-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-2" />
                  Create Article
                </>
              )}
            </Button>

            {/* Info Note */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              Fill in the details above, then use the editor to create your content.
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Article Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Article Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
              placeholder="Enter article title"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="authored_by">Author *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="authored_by"
                value={formData.authored_by || ''}
                onChange={(e) => handleInputChange('authored_by', e.target.value)}
                className={`pl-10 ${errors.authored_by ? 'border-red-500' : ''}`}
                placeholder="Enter author name"
                disabled={isSubmitting}
              />
            </div>
            {errors.authored_by && (
              <p className="text-sm text-red-500">{errors.authored_by}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label htmlFor="status">Article Status</Label>
            <Select 
              value={formData.status || 'review'} 
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select article status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center space-x-2">
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Status Preview */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={currentStatus.color}>
                {currentStatus.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {currentStatus.description}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-3">
            <Label htmlFor="cover_image">Cover Image</Label>
            
            {formData.cover_image_url && (
              <div className="relative w-full max-w-md">
                <img
                  src={formData.cover_image_url}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
                  disabled={isSubmitting}
                >
                  Remove
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover-image-input')?.click()}
                disabled={isSubmitting || isUploadingImage}
                className="flex items-center space-x-2"
              >
                {isUploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>{formData.cover_image_url ? 'Change Image' : 'Upload Image'}</span>
                  </>
                )}
              </Button>
              <input
                id="cover-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a cover image for your article. Recommended size: 1200x630px
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="flex items-center space-x-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Article</span>
                </>
              )}
            </Button>
          </div>

          {/* Info Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Fill in the basic article details above, then use the editor below to create your content. 
              The article will be created when you click "Create Article".
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}