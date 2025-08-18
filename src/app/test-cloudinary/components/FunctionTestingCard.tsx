'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle, XCircle, Clock, Play, AlertCircle, Info } from 'lucide-react';
import { TestResult } from '../page';

interface FunctionTestingCardProps {
  testResults: Record<string, TestResult>;
  testPublicId: string;
  isTesting: boolean;
  selectedFile: File | null;
  testUploadImage: () => Promise<void>;
  testGetImageUrl: () => void;
  testUpdateImage: () => Promise<void>;
  testDeleteImage: () => Promise<void>;
  runAllTests: () => Promise<void>;
}

export function FunctionTestingCard({ 
  testResults, 
  testPublicId, 
  isTesting, 
  selectedFile,
  testUploadImage, 
  testGetImageUrl, 
  testUpdateImage, 
  testDeleteImage, 
  runAllTests 
}: FunctionTestingCardProps) {
  const getTestIcon = (result?: TestResult) => {
    if (!result) return <Clock className="h-4 w-4 text-gray-400" />;
    return result.success 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getTestBadge = (result?: TestResult) => {
    if (!result) return <Badge variant="outline">Not Run</Badge>;
    return result.success 
      ? <Badge variant="default">Pass</Badge>
      : <Badge variant="destructive">Fail</Badge>;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return `${duration}ms`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Function Testing Suite
        </CardTitle>
        <CardDescription>
          Test individual Cloudinary service functions with performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            Select a file first, then run individual tests or all tests together. 
            Tests run in sequence: Upload → Get URL → Update → Delete.
          </div>
        </div>

        {!selectedFile && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-700">
              Please select a file above before running tests.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Test */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTestIcon(testResults.uploadImage)}
                <span className="font-medium">Upload Image</span>
              </div>
              {getTestBadge(testResults.uploadImage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testUploadImage}
              disabled={!selectedFile || isTesting}
              className="w-full"
            >
              Test Upload
            </Button>
            {testResults.uploadImage && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {formatDuration(testResults.uploadImage.duration)}
                </p>
                <p className="text-xs break-words">
                  {testResults.uploadImage.message}
                </p>
              </div>
            )}
          </div>

          {/* Get URL Test */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTestIcon(testResults.getImageUrl)}
                <span className="font-medium">Get Image URL</span>
              </div>
              {getTestBadge(testResults.getImageUrl)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testGetImageUrl}
              disabled={!testPublicId || isTesting}
              className="w-full"
            >
              Test Get URL
            </Button>
            {testResults.getImageUrl && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {formatDuration(testResults.getImageUrl.duration)}
                </p>
                <p className="text-xs break-words">
                  {testResults.getImageUrl.message}
                </p>
              </div>
            )}
          </div>

          {/* Update Test */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTestIcon(testResults.updateImage)}
                <span className="font-medium">Update Image</span>
              </div>
              {getTestBadge(testResults.updateImage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testUpdateImage}
              disabled={!testPublicId || !selectedFile || isTesting}
              className="w-full"
            >
              Test Update
            </Button>
            {testResults.updateImage && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {formatDuration(testResults.updateImage.duration)}
                </p>
                <p className="text-xs break-words">
                  {testResults.updateImage.message}
                </p>
              </div>
            )}
          </div>

          {/* Delete Test */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTestIcon(testResults.deleteImage)}
                <span className="font-medium">Delete Image</span>
              </div>
              {getTestBadge(testResults.deleteImage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testDeleteImage}
              disabled={!testPublicId || isTesting}
              className="w-full"
            >
              Test Delete
            </Button>
            {testResults.deleteImage && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {formatDuration(testResults.deleteImage.duration)}
                </p>
                <p className="text-xs break-words">
                  {testResults.deleteImage.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Run All Tests */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium">Run All Tests</h4>
              <p className="text-sm text-muted-foreground">
                Execute all tests in sequence with delays
              </p>
            </div>
            {testPublicId && (
              <Badge variant="outline">Test ID: {testPublicId.substring(0, 10)}...</Badge>
            )}
          </div>
          <Button
            onClick={runAllTests}
            disabled={!selectedFile || isTesting}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {isTesting ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {/* Test Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="font-medium">Test Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">
                  {Object.values(testResults).filter(r => r.success).length}
                </div>
                <div className="text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">
                  {Object.values(testResults).filter(r => !r.success).length}
                </div>
                <div className="text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">
                  {Object.keys(testResults).length}
                </div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">
                  {Object.values(testResults).reduce((sum, r) => sum + (r.duration || 0), 0)}ms
                </div>
                <div className="text-muted-foreground">Total Time</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}