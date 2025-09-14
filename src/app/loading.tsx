import Image from 'next/image';
import { moderniz } from '@/lib/fonts';

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        {/* CESAFI Logo with Animation */}
        <div className="relative">
          <div className="animate-pulse">
            <Image
              src="/img/cesafi-logo.webp"
              alt="CESAFI Logo"
              width={120}
              height={120}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>
          
          {/* Pulsing Ring Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-primary/30 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border border-primary/20 rounded-full animate-ping delay-300"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className={`${moderniz.className} text-2xl font-bold text-foreground animate-pulse`}>
            CESAFI Sports
          </h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
