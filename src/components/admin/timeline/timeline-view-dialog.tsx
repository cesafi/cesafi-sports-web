'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Timeline } from '@/lib/types/timeline';
import { Calendar, Star, StarOff } from 'lucide-react';
import Image from 'next/image';

interface TimelineViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeline: Timeline | null;
  onClose: () => void;
}

export function TimelineViewDialog({ open, onOpenChange, timeline }: TimelineViewDialogProps) {
  if (!timeline) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'founding':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'milestone':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'award':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'expansion':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'achievement':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline Event Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative">
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <Image
                src={timeline.image_url}
                alt={timeline.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Year</span>
                  </div>
                  <div className="font-mono text-lg font-bold">
                    {timeline.year}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                  </div>
                  <Badge className={getCategoryColor(timeline.category)}>
                    {timeline.category.charAt(0).toUpperCase() + timeline.category.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{timeline.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {timeline.description}
              </p>
            </div>
          </div>

          {/* Highlight Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {timeline.is_highlight ? (
                  <>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">This is a highlight event</span>
                  </>
                ) : (
                  <>
                    <StarOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Regular event</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(timeline.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {timeline.updated_at && (
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(timeline.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
