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

interface HeadWriterArticleFormProps {
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

export function HeadWriterArticleForm({ onSubmit, isSubmitting, initialData, compact = false }: HeadWriterArticleFormProps) {
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
        folder: 'articles/covers'
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium">Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter article title"
              className="text-sm h-8"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <Label htmlFor="authored_by" className="text-xs font-medium">Author</Label>
            <Input
              id="authored_by"
              value={formData.authored_by || ''}
              onChange={(e) => handleInputChange('authored_by', e.target.value)}
              placeholder="Enter author name"
              className="text-sm h-8"
              disabled={isSubmitting}
            />
            {errors.authored_by && (
              <p className="text-xs text-red-600">{errors.authored_by}</p>
            )}
          </div>

          {/* Status - Head writers can change this */}
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-medium">Status</Label>
            <Select 
              value={formData.status || 'review'} 
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-sm h-8">
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
              <span className="text-xs text-muted-foreground">{currentStatus.description}</span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cover Image</Label>
            
            {formData.cover_image_url && (
              <div className="relative w-full">
                <img
                  src={formData.cover_image_url}
                  alt="Cover preview"
                  className="w-full h-16 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0 text-xs"
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
              className="w-full text-xs h-8"
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
            className="w-full text-sm h-8 mt-4"
            onClick={handleSubmit}
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Create New Article</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium">Title</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter article title"
            className="text-sm"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <Label htmlFor="authored_by" className="text-sm font-medium">Author</Label>
          <Input
            id="authored_by"
            value={formData.authored_by || ''}
            onChange={(e) => handleInputChange('authored_by', e.target.value)}
            placeholder="Enter author name"
            className="text-sm"
            disabled={isSubmitting}
          />
          {errors.authored_by && (
            <p className="text-sm text-red-600">{errors.authored_by}</p>
          )}
        </div>

        {/* Status - Head writers can change this */}
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-sm font-medium">Status</Label>
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
            <Badge variant="secondary" className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{currentStatus.description}</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Cover Image</Label>
          
          {formData.cover_image_url && (
            <div className="relative w-full">
              <img
                src={formData.cover_image_url}
                alt="Cover preview"
                className="w-full h-32 object-cover rounded border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
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
            className="w-full"
          >
            {isUploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
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
          className="w-full"
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Article
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
