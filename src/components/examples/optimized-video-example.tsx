'use client';

import LazyYouTube from '@/components/ui/lazy-youtube';

export default function OptimizedVideoExample() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Optimized Video Examples</h2>
      
      {/* Example 1: With Thumbnail */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Thumbnail (Click to Load)</h3>
        <div className="w-full h-64 border rounded-lg overflow-hidden">
          <LazyYouTube
            videoId="8Mz9ytswq7E"
            title="CESAFI Season 25 Basketball Battle"
            showThumbnail={true}
            controls={true}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Example 2: Auto-loading on scroll */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Auto-load on Scroll (Background Video)</h3>
        <div className="w-full h-64 border rounded-lg overflow-hidden">
          <LazyYouTube
            videoId="8Mz9ytswq7E"
            title="CESAFI Season 25 Basketball Battle"
            autoplay={true}
            muted={true}
            loop={true}
            controls={false}
            showThumbnail={false}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}