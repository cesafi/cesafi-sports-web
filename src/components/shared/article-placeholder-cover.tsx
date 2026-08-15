'use client';

import Image from 'next/image';
import { moderniz } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface ArticlePlaceholderCoverProps {
  title: string;
  category?: string;
  className?: string;
  /** 'hero' for the full article page, 'card' for thumbnails */
  variant?: 'hero' | 'card';
}

/**
 * A branded placeholder cover for articles without a cover image.
 * Uses the CEL brand gradient with the CESAFI logo watermark and
 * a subtle diagonal pattern for visual texture.
 */
export default function ArticlePlaceholderCover({
  title,
  category,
  className,
  variant = 'card',
}: ArticlePlaceholderCoverProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        className
      )}
    >
      {/* Gradient background — CESAFI Teal to Emerald to Dark */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #336c61 0%, #19b33e 40%, #0a2618 100%)',
        }}
      />

      {/* Subtle diagonal lines pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            white 10px,
            white 11px
          )`,
        }}
      />

      {/* Center logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn(
          'relative w-full h-full opacity-10',
          variant === 'hero' ? 'max-w-md max-h-64' : 'max-w-[80%] max-h-[80%]'
        )}>
          <Image
            src="/img/cesafi-logo.webp"
            alt=""
            fill
            className="object-contain"
            aria-hidden="true"
          />
        </div>
      </div>



      {/* Bottom gradient fade for hero */}
      {variant === 'hero' && (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  );
}
