'use client';

import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FloatingNavButtonProps {
  readonly isVisible: boolean;
  readonly direction: 'up' | 'down';
  readonly onClick: () => void;
}

export default function FloatingNavButton({ isVisible, direction, onClick }: FloatingNavButtonProps) {
  if (!isVisible) return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      size="icon"
    >
      {direction === 'up' ? (
        <ChevronUp className="h-6 w-6" />
      ) : (
        <ChevronDown className="h-6 w-6" />
      )}
    </Button>
  );
}
