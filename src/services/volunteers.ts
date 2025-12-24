import { z } from 'zod';
import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { Volunteer, VolunteersPaginationOptions } from '@/lib/types/volunteers';
import CloudinaryService from './cloudinary';
import { createVolunteerSchema, updateVolunteerSchema } from '@/lib/validations/volunteers';
import { nowUtc } from '@/lib/utils/utc-time';

const TABLE_NAME = 'volunteers';

export class VolunteerService extends BaseService {
  static async getPaginated(
    options: VolunteersPaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Volunteer>>> {
    try {
      const searchableFields = ['full_name'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<Volunteer, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated volunteers.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Volunteer[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('department_id', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME} entity.`);
    }
  }

  static async getCount(): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return { success: true, data: count || 0 };
    } catch (err) {
      return this.formatError(err, `Failed to get ${TABLE_NAME} count.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Volunteer>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from(TABLE_NAME).select().eq('id', id).single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} entity.`);
    }
  }

  static async getByDepartment(departmentId: number): Promise<ServiceResponse<Volunteer[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .eq('department_id', departmentId)
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch volunteers by department_id.`);
    }
  }

  static async insert(
    data: z.infer<typeof createVolunteerSchema>
  ): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      // Validate required fields
      if (!data.full_name || data.full_name.trim().length === 0) {
        return {
          success: false,
          error: 'Full name is required and cannot be empty.'
        };
      }

      // Check for duplicate volunteer by full name
      const { data: existingVolunteer, error: duplicateError } = await supabase
        .from(TABLE_NAME)
        .select('id, full_name')
        .eq('full_name', data.full_name.trim())
        .limit(1);

      if (duplicateError) {
        throw duplicateError;
      }

      if (existingVolunteer && existingVolunteer.length > 0) {
        return {
          success: false,
          error: `A volunteer with the name "${data.full_name}" already exists.`
        };
      }

      const { error } = await supabase.from(TABLE_NAME).insert({
        ...data,
        full_name: data.full_name.trim(),
        created_at: nowUtc(),
        updated_at: nowUtc()
      });

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(
    data: z.infer<typeof updateVolunteerSchema>
  ): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const supabase = await this.getClient();

      // Validate full_name if provided
      if (data.full_name !== undefined) {
        if (!data.full_name || data.full_name.trim().length === 0) {
          return {
            success: false,
            error: 'Full name cannot be empty.'
          };
        }

        // Check for duplicate volunteer by full name (excluding current volunteer)
        const { data: existingVolunteer, error: duplicateError } = await supabase
          .from(TABLE_NAME)
          .select('id, full_name')
          .eq('full_name', data.full_name.trim())
          .neq('id', data.id)
          .limit(1);

        if (duplicateError) {
          throw duplicateError;
        }

        if (existingVolunteer && existingVolunteer.length > 0) {
          return {
            success: false,
            error: `A volunteer with the name "${data.full_name}" already exists.`
          };
        }
      }

      const updateData = { ...data };
      if (updateData.full_name) {
        updateData.full_name = updateData.full_name.trim();
      }

      const { error } = await supabase.from(TABLE_NAME).update({
        ...updateData,
        updated_at: nowUtc()
      }).eq('id', data.id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update ${TABLE_NAME} entity.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Entity ID is required to delete.' };
      }

      const supabase = await this.getClient();

      // First, get the volunteer to check if it has an image
      const { data: volunteer, error: fetchError } = (await supabase
        .from(TABLE_NAME)
        .select('image_url')
        .eq('id', id)
        .single()) as { data: { image_url: string | null } | null; error: Error | null };

      if (fetchError) {
        throw fetchError;
      }

      // Delete the image from Cloudinary if it exists
      if (volunteer?.image_url) {
        try {
          // Extract public_id from the URL for deletion
          const url = volunteer.image_url;
          // Match the full path after /upload/ or /upload/vX_Y_Z/ and remove extension
          const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i);

          if (publicIdMatch) {
            const publicId = publicIdMatch[1]; // This includes the full folder path without extension

            await CloudinaryService.deleteImage(publicId, { resourceType: 'image' });
          }
        } catch (cloudinaryError) {
          // Log the error but don't block the database deletion
          console.warn('Failed to delete volunteer image from Cloudinary:', cloudinaryError);
        }
      }

      // Now delete from database
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete ${TABLE_NAME} entity.`);
    }
  }
}
