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
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform?: string) => {
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
    } catch (error) {
      toast.error('Failed to share article');
    } finally {
      setIsSharing(false);
    }
  };

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
          disabled={isSharing}
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleShare('facebook')}
          disabled={isSharing}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleShare()}
          disabled={isSharing}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
      </CardContent>
    </Card>
  );
}
