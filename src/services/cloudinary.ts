
import { getCldImageUrl, getCldOgImageUrl } from 'next-cloudinary';
import {
  CloudinaryUploadOptions,
  CloudinaryTransformationOptions,
  CloudinaryUploadResult,
  CloudinaryDeleteResult,
  CloudinaryServiceResponse
} from '@/lib/types/cloudinary';

class CloudinaryService {
  static async uploadImage(
    file: File,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryServiceResponse<CloudinaryUploadResult>> {
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Use unsigned upload preset for client-side uploads
      const uploadPreset = 'cesafi-uploads';
      formData.append('upload_preset', uploadPreset);
      
      // Add folder if specified
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      // Add optional parameters
      if (options.public_id) {
        formData.append('public_id', options.public_id);
      }
      if (options.overwrite) {
        formData.append('overwrite', 'true');
      }

      // Upload to Cloudinary using next-cloudinary approach
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error?.message || 'Upload failed'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  static getImageUrl(
    publicId: string,
    transformations: CloudinaryTransformationOptions = {}
  ): string {
    try {
      // Use next-cloudinary's getCldImageUrl for optimized URL generation
      return getCldImageUrl({
        src: publicId,
        width: transformations.width,
        height: transformations.height,
        crop: transformations.crop,
        quality: transformations.quality,
        format: transformations.format,
        gravity: transformations.gravity
      });
    } catch {
      // Fallback to manual URL construction if next-cloudinary fails
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const transforms = [];
      
      if (transformations.width) transforms.push(`w_${transformations.width}`);
      if (transformations.height) transforms.push(`h_${transformations.height}`);
      if (transformations.crop) transforms.push(`c_${transformations.crop}`);
      if (transformations.quality) transforms.push(`q_${transformations.quality}`);
      if (transformations.format) transforms.push(`f_${transformations.format}`);
      if (transformations.gravity) transforms.push(`g_${transformations.gravity}`);
      
      const transformString = transforms.length > 0 ? `${transforms.join(',')}/` : '';
      
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
    }
  }

  static async updateImage(
    publicId: string,
    newFile: File,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryServiceResponse<CloudinaryUploadResult>> {
    // For updates, we upload with the same public_id and overwrite: true
    const updateOptions = {
      ...options,
      public_id: publicId,
      overwrite: true
    };

    return await this.uploadImage(newFile, updateOptions);
  }

  static async deleteImage(
    publicId: string
  ): Promise<CloudinaryServiceResponse<CloudinaryDeleteResult>> {
    try {
      // Delete via Cloudinary API
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      
      if (!apiKey || !apiSecret) {
        return {
          success: false,
          error: 'Cloudinary API credentials not configured for delete operations'
        };
      }

      // Generate signature for delete operation
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await this.generateSignature({
        public_id: publicId,
        timestamp: timestamp.toString()
      }, apiSecret);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error?.message || 'Delete failed'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  private static async generateSignature(
    params: Record<string, string>,
    apiSecret: string
  ): Promise<string> {
    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Create signature string
    const signatureString = `${sortedParams}${apiSecret}`;

    // Generate SHA-1 hash (you might need a crypto library for this in browser)
    // For now, we'll use a simple implementation
    // In production, you should handle this server-side
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static getOgImageUrl(
    publicId: string,
    transformations: CloudinaryTransformationOptions = {}
  ): string {
    try {
      // Use next-cloudinary's getCldOgImageUrl for Open Graph images
      return getCldOgImageUrl({
        src: publicId,
        width: transformations.width || 1200,
        height: transformations.height || 630,
        crop: (transformations.crop as 'fill') || 'fill',
        quality: (transformations.quality as 'auto') || 'auto',
        format: (transformations.format as 'jpg') || 'jpg'
      });
    } catch {
      // Fallback to regular image URL
      return this.getImageUrl(publicId, {
        ...transformations,
        width: transformations.width || 1200,
        height: transformations.height || 630,
        crop: transformations.crop || 'fill',
        format: transformations.format || 'jpg'
      });
    }
  }
}

export default CloudinaryService;