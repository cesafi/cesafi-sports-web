'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Activity } from 'lucide-react';

interface ServiceStatusCardProps {
  cloudinary: {
    isLoading: boolean;
    hasError: boolean;
    hasSuccess: boolean;
    isUploading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    uploadError: string | null;
    updateError: string | null;
    deleteError: string | null;
  };
}

export function ServiceStatusCard({ cloudinary }: ServiceStatusCardProps) {
  const getStatusIcon = () => {
    if (cloudinary.isLoading) return <Activity className="h-4 w-4 animate-spin text-blue-500" />;
    if (cloudinary.hasError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (cloudinary.hasSuccess) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (cloudinary.isLoading) return 'Processing...';
    if (cloudinary.hasError) return 'Error occurred';
    if (cloudinary.hasSuccess) return 'Operation successful';
    return 'Ready';
  };

  const getStatusBadge = () => {
    if (cloudinary.isLoading) return <Badge variant="secondary">Processing</Badge>;
    if (cloudinary.hasError) return <Badge variant="destructive">Error</Badge>;
    if (cloudinary.hasSuccess) return <Badge variant="default">Success</Badge>;
    return <Badge variant="outline">Ready</Badge>;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Cloudinary Service Status
        </CardTitle>
        <CardDescription>
          Current status of Cloudinary operations and hook states
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Overall Status</h4>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-sm text-muted-foreground">{getStatusText()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Operation States</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Upload:</span>
                <Badge variant={cloudinary.isUploading ? "secondary" : "outline"}>
                  {cloudinary.isUploading ? "Active" : "Idle"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Update:</span>
                <Badge variant={cloudinary.isUpdating ? "secondary" : "outline"}>
                  {cloudinary.isUpdating ? "Active" : "Idle"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Delete:</span>
                <Badge variant={cloudinary.isDeleting ? "secondary" : "outline"}>
                  {cloudinary.isDeleting ? "Active" : "Idle"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Error Status</h4>
            <div className="space-y-1 text-sm">
              {cloudinary.uploadError && (
                <div className="text-red-600">Upload: {cloudinary.uploadError}</div>
              )}
              {cloudinary.updateError && (
                <div className="text-red-600">Update: {cloudinary.updateError}</div>
              )}
              {cloudinary.deleteError && (
                <div className="text-red-600">Delete: {cloudinary.deleteError}</div>
              )}
              {!cloudinary.hasError && (
                <div className="text-muted-foreground">No errors</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}