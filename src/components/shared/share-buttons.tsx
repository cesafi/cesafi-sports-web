'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { moderniz } from '@/lib/fonts';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url?: string;
  variant?: 'default' | 'compact' | 'expanded' | 'full';
  disabled?: boolean;
}

export default function ShareButtons({ title, url, variant = 'default', disabled = false }: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform?: string) => {
    if (disabled) return;
    
    setIsSharing(true);
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    try {
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (_error) {
      toast.error('Failed to share article');
    } finally {
      setIsSharing(false);
    }
  };

  // Compact variant - horizontal buttons without card
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          disabled={disabled || isSharing}
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          disabled={disabled || isSharing}
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare()}
          disabled={disabled || isSharing}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Expanded variant - horizontal buttons with labels
  if (variant === 'expanded') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          disabled={disabled || isSharing}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          disabled={disabled || isSharing}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare()}
          disabled={disabled || isSharing}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
    );
  }

  // Full variant - horizontal buttons with labels (same as expanded but different name for clarity)
  if (variant === 'full') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          disabled={disabled || isSharing}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          disabled={disabled || isSharing}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare()}
          disabled={disabled || isSharing}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
    );
  }

  // Default variant - card with vertical buttons
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className={`${moderniz.className} text-lg flex items-center gap-2`}>
          <Share2 className="h-5 w-5" />
          Share Article
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleShare('twitter')}
          disabled={disabled || isSharing}
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleShare('facebook')}
          disabled={disabled || isSharing}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleShare()}
          disabled={disabled || isSharing}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
      </CardContent>
    </Card>
  );
}
