'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHeroSectionLiveSchema, updateHeroSectionLiveSchema, CreateHeroSectionLiveInput, UpdateHeroSectionLiveInput } from '@/lib/validations/hero-section';
import { HeroSectionLive } from '@/lib/types/hero-section';
import { useCreateHeroSectionLive } from '@/hooks/use-hero-section';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Video, Calendar } from 'lucide-react';

interface HeroSectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hero?: HeroSectionLive | null;
  onSubmit?: (data: Partial<HeroSectionLive>) => void;
}

export function HeroSectionFormDialog({ open, onOpenChange, hero, onSubmit }: HeroSectionFormDialogProps) {
  const isEditing = !!hero;
  const createMutation = useCreateHeroSectionLive();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CreateHeroSectionLiveInput | UpdateHeroSectionLiveInput>({
    resolver: zodResolver(isEditing ? updateHeroSectionLiveSchema : createHeroSectionLiveSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      video_link: '',
      end_at: '',
    },
  });

  useEffect(() => {
    if (hero) {
      reset({
        video_link: hero.video_link,
        end_at: hero.end_at,
      });
    } else {
      reset({
        video_link: '',
        end_at: '',
      });
    }
  }, [hero, reset]);

  const onSubmitForm = async (data: CreateHeroSectionLiveInput | UpdateHeroSectionLiveInput) => {
    try {
      if (isEditing && onSubmit) {
        onSubmit(data);
      } else {
        await createMutation.mutateAsync(data as CreateHeroSectionLiveInput);
        onOpenChange(false);
        reset();
      }
    } catch (error) {
      console.error('Error submitting hero section:', error);
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>{isEditing ? 'Edit Hero Section' : 'Add New Hero Section'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video_link">Video URL *</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="video_link"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10"
                    {...register('video_link')}
                  />
                </div>
                {errors.video_link && (
                  <p className="text-sm text-red-600">{errors.video_link.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  Enter a YouTube video URL. The video will be embedded on the homepage.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_at">End Date & Time *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="end_at"
                    type="datetime-local"
                    className="pl-10"
                    {...register('end_at')}
                  />
                </div>
                {errors.end_at && (
                  <p className="text-sm text-red-600">{errors.end_at.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  The video will stop showing after this date and time. Must be in the future.
                </p>
              </div>
            </div>

            {/* Preview Section */}
            {watch('video_link') && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Preview</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Video URL: <code className="bg-white px-2 py-1 rounded text-xs">{watch('video_link')}</code>
                  </p>
                  {watch('end_at') && (
                    <p className="text-sm text-gray-600">
                      Expires: <code className="bg-white px-2 py-1 rounded text-xs">{new Date(watch('end_at')!).toLocaleString()}</code>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Hero Section' : 'Add Hero Section'}
              </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
