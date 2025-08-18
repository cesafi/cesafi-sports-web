'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Info } from 'lucide-react';

interface TransformationsCardProps {
  transformWidth: number;
  setTransformWidth: (width: number) => void;
  transformHeight: number;
  setTransformHeight: (height: number) => void;
  uploadedImages: { publicId: string; url: string; originalUrl: string }[];
}

export function TransformationsCard({ 
  transformWidth, 
  setTransformWidth, 
  transformHeight, 
  setTransformHeight,
  uploadedImages 
}: TransformationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Image Transformations
        </CardTitle>
        <CardDescription>
          Configure image transformation parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            Set transformation parameters, then apply to uploaded images below.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              value={transformWidth}
              onChange={(e) => setTransformWidth(Number(e.target.value))}
              min="50"
              max="2000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={transformHeight}
              onChange={(e) => setTransformHeight(Number(e.target.value))}
              min="50"
              max="2000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Settings:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Dimensions: {transformWidth} × {transformHeight}px</div>
            <div>• Crop mode: fill (default)</div>
            <div>• Quality: auto (optimized)</div>
          </div>
        </div>

        {uploadedImages.length === 0 && (
          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg text-center">
            Upload images to test transformations
          </div>
        )}
      </CardContent>
    </Card>
  );
}