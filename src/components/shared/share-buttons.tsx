'use client';

import { useState, type MouseEvent, type SVGProps } from 'react';
import { Share2, Facebook, Instagram, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { moderniz } from '@/lib/fonts';
import { toast } from 'sonner';
import { getShareIntentUrl, isValidShareUrl } from '@/lib/utils/site-url';

interface ShareButtonsProps {
  title: string;
  url?: string;
  variant?: 'default' | 'compact' | 'expanded' | 'full';
  disabled?: boolean;
}

// Drawn with strokes to match the lucide icons beside it
function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

const SHARE_OPTIONS = [
  { id: 'x', label: 'X', ariaLabel: 'Share on X', icon: XIcon },
  { id: 'facebook', label: 'Facebook', ariaLabel: 'Share on Facebook', icon: Facebook },
  { id: 'instagram', label: 'Instagram', ariaLabel: 'Share on Instagram', icon: Instagram },
  { id: 'copy', label: 'Copy Link', ariaLabel: 'Copy article link', icon: LinkIcon }
] as const;

type ShareOption = (typeof SHARE_OPTIONS)[number];

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // In-app browsers can reject the clipboard API, so fall through to the older approach
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}

export default function ShareButtons({
  title,
  url,
  variant = 'default',
  disabled = false
}: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  // Validate URL to prevent malicious URLs
  const isShareable = Boolean(shareUrl) && isValidShareUrl(shareUrl);

  const copyFailed = () => toast.error('Failed to copy link. Please copy manually: ' + shareUrl);

  const handleCopy = async () => {
    if (await copyToClipboard(shareUrl)) {
      toast.success('Link copied to clipboard!');
    } else {
      copyFailed();
    }
  };

  const handleInstagram = async () => {
    // Instagram has no web share URL. Phones can reach the app through the share sheet;
    // desktop share sheets don't offer it, so the link is copied for pasting instead.
    const hasPhoneShareSheet =
      typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

    if (hasPhoneShareSheet) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
      }
    }

    if (await copyToClipboard(shareUrl)) {
      toast.success('Link copied! Paste it into your Instagram story or message.', {
        action: {
          label: 'Open Instagram',
          onClick: () => window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
        }
      });
    } else {
      copyFailed();
    }
  };

  const handleButtonShare = async (optionId: ShareOption['id']) => {
    if (!isShareable) {
      toast.error('Invalid URL for sharing');
      return;
    }

    setIsSharing(true);
    try {
      await (optionId === 'instagram' ? handleInstagram() : handleCopy());
    } finally {
      setIsSharing(false);
    }
  };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isShareable) {
      event.preventDefault();
      toast.error('Invalid URL for sharing');
    }
  };

  const renderOption = (option: ShareOption, className: string, showLabel: boolean) => {
    const Icon = option.icon;
    const content = (
      <>
        <Icon aria-hidden="true" />
        {showLabel && option.label}
      </>
    );

    // Real links keep working in in-app browsers such as Messenger, which block scripted popups
    if ((option.id === 'x' || option.id === 'facebook') && !disabled) {
      return (
        <Button key={option.id} asChild variant="outline" size="icon" className={className}>
          <a
            href={getShareIntentUrl(option.id, title, shareUrl)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={option.ariaLabel}
            onClick={handleLinkClick}
          >
            {content}
          </a>
        </Button>
      );
    }

    return (
      <Button
        key={option.id}
        variant="outline"
        size="icon"
        className={className}
        aria-label={option.ariaLabel}
        onClick={() => handleButtonShare(option.id)}
        disabled={disabled || isSharing}
      >
        {content}
      </Button>
    );
  };

  // Compact variant - horizontal icon buttons without card
  if (variant === 'compact') {
    return (
      <div role="group" aria-label="Share this article" className="flex items-center gap-2">
        {SHARE_OPTIONS.map((option) => renderOption(option, 'size-11 [&_svg]:size-5', false))}
      </div>
    );
  }

  // Expanded and full variants - equal buttons with labels
  if (variant === 'expanded' || variant === 'full') {
    return (
      <div
        role="group"
        aria-label="Share this article"
        className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
      >
        {SHARE_OPTIONS.map((option) => renderOption(option, 'h-11 w-full px-4 sm:w-auto [&_svg]:size-5', true))}
      </div>
    );
  }

  // Default variant - card with vertical buttons
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className={`${moderniz.className} flex items-center gap-2 text-lg`}>
          <Share2 className="h-5 w-5" />
          Share Article
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {SHARE_OPTIONS.map((option) =>
          renderOption(option, 'h-11 w-full justify-start px-4 [&_svg]:size-5', true)
        )}
      </CardContent>
    </Card>
  );
}
