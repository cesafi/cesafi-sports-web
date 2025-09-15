'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/shared/image-upload';
import { createTimelineSchema, updateTimelineSchema } from '@/lib/validations/timeline';
import { Timeline, TimelineInsert, TimelineUpdate } from '@/lib/types/timeline';
import { useCreateTimeline, useUpdateTimeline } from '@/hooks/use-timeline';
import { toast } from 'sonner';
import { Loader2, Calendar } from 'lucide-react';

interface TimelineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeline?: Timeline | null;
  onClose: () => void;
}

type FormData = TimelineInsert | TimelineUpdate;

const timelineCategories = [
  { value: 'founding', label: 'Founding' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'award', label: 'Award' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'achievement', label: 'Achievement' }
];

export function TimelineFormDialog({ open, onOpenChange, timeline, onClose }: TimelineFormDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);

  const isEditing = !!timeline;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateTimelineSchema : createTimelineSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      title: '',
      description: '',
      year: '',
      category: 'milestone',
      image_url: '',
      is_highlight: false
    }
  });

  const createMutation = useCreateTimeline({
    onSuccess: () => {
      toast.success('Timeline event created successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to create timeline event: ${error.message}`);
    }
  });

  const updateMutation = useUpdateTimeline({
    onSuccess: () => {
      toast.success('Timeline event updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to update timeline event: ${error.message}`);
    }
  });

  // Initialize form with timeline data when editing
  useEffect(() => {
    if (timeline) {
      reset({
        title: timeline.title,
        description: timeline.description,
        year: timeline.year,
        category: timeline.category as 'founding' | 'milestone' | 'award' | 'expansion' | 'achievement',
        image_url: timeline.image_url,
        is_highlight: timeline.is_highlight
      });
      setImageUrl(timeline.image_url);
    } else {
      reset({
        title: '',
        description: '',
        year: '',
        category: 'milestone',
        image_url: '',
        is_highlight: false
      });
      setImageUrl('');
    }
  }, [timeline, reset]);

  const handleClose = () => {
    reset();
    setImageUrl('');
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && timeline) {
        const updateData: TimelineUpdate = {
          id: timeline.id,
          ...data
        };
        await updateMutation.mutateAsync(updateData);
      } else {
        await createMutation.mutateAsync(data as TimelineInsert);
      }
    } catch (_error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setValue('image_url', url);
  };


  const handleImageUploadEnd = () => {
    setIsImageUploading(false);
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Timeline Event' : 'Create Timeline Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Event Image</Label>
            <Card className="p-4">
              <div className="space-y-4">
                {imageUrl ? (
                  <div className="relative">
                  <Image
                    src={imageUrl}
                    alt="Timeline event preview"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageUrl('');
                        setValue('image_url', '');
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <ImageUpload
                    onUpload={handleImageUpload}
                    onUploadStart={() => setIsImageUploading(true)}
                    onUploadEnd={handleImageUploadEnd}
                    preset="TIMELINE"
                    currentImageUrl={imageUrl}
                    placeholder="Upload timeline event image"
                    description="Upload an image that represents this timeline event"
                    required={false}
                    className="w-full"
                  />
                )}
                {isImageUploading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Uploading image...</span>
                  </div>
                )}
              </div>
            </Card>
            {errors.image_url && (
              <p className="text-sm text-destructive">{errors.image_url.message}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="year"
                  {...register('year')}
                  placeholder="e.g., 2001, 2025+"
                  className="pl-10"
                />
              </div>
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as 'founding' | 'milestone' | 'award' | 'expansion' | 'achievement')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {timelineCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter event description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Highlight Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_highlight"
              checked={watch('is_highlight')}
              onCheckedChange={(checked) => setValue('is_highlight', checked)}
            />
            <Label htmlFor="is_highlight">Mark as highlight event</Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
