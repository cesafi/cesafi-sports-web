import { BaseService } from './base';
import { HeroSectionLive, HeroSectionLiveInsert, HeroSectionLiveUpdate, HeroSectionLivePaginationOptions, HeroSectionLiveWithDetails, CurrentHeroSectionResponse } from '@/lib/types/hero-section';
import { ServiceResponse, PaginatedResponse } from '@/lib/types/base';

const TABLE_NAME = 'hero_section_live' as const;

export class HeroSectionService extends BaseService {
  protected static tableName = TABLE_NAME;

  /**
   * Get paginated hero section live items with search and filters
   */
  static async getPaginated(options: HeroSectionLivePaginationOptions): Promise<ServiceResponse<PaginatedResponse<HeroSectionLive>>> {
    try {
      const searchableFields = ['video_link'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<HeroSectionLive, 'hero_section_live'>(
        TABLE_NAME,
        optionsWithSearchableFields,
        '*'
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated ${TABLE_NAME}.`);
    }
  }

  /**
   * Get all hero section live items
   */
  static async getAll(): Promise<ServiceResponse<HeroSectionLive[]>> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME}.`);
    }
  }

  /**
   * Get current active hero section (most recent that hasn't expired)
   */
  static async getCurrentActive(): Promise<CurrentHeroSectionResponse> {
    try {
      const client = await this.getClient();
      const now = new Date().toISOString();
      
      const { data, error } = await client
        .from(TABLE_NAME)
        .select('*')
        .gt('end_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // No active hero section found
        return { success: true, data: null };
      }

      // Add computed fields
      const heroSectionWithDetails: HeroSectionLiveWithDetails = {
        ...data,
        is_active: true,
        is_expired: false,
        time_remaining: this.calculateTimeRemaining(data.end_at),
        formatted_end_date: new Date(data.end_at).toLocaleString(),
      };

      return { success: true, data: heroSectionWithDetails };
    } catch (_err) {
      return { success: false, error: `Failed to fetch current active hero section.` };
    }
  }

  /**
   * Get a single hero section live item by ID
   */
  static async getById(id: number): Promise<ServiceResponse<HeroSectionLive>> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} with ID ${id}.`);
    }
  }

  /**
   * Create new hero section live item
   */
  static async insert(heroData: HeroSectionLiveInsert): Promise<ServiceResponse<HeroSectionLive>> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(TABLE_NAME)
        .insert(heroData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to create ${TABLE_NAME}.`);
    }
  }

  /**
   * Update hero section live item by ID
   */
  static async updateById(id: number, heroData: HeroSectionLiveUpdate): Promise<ServiceResponse<HeroSectionLive>> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(TABLE_NAME)
        .update(heroData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to update ${TABLE_NAME} with ID ${id}.`);
    }
  }

  /**
   * Delete hero section live item by ID
   */
  static async deleteById(id: number): Promise<ServiceResponse<null>> {
    try {
      const client = await this.getClient();
      const { error } = await client
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, data: null };
    } catch (err) {
      return this.formatError(err, `Failed to delete ${TABLE_NAME} with ID ${id}.`);
    }
  }

  /**
   * Calculate time remaining until expiration
   */
  private static calculateTimeRemaining(endAt: string): string {
    const now = new Date();
    const endDate = new Date(endAt);
    const diffMs = endDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
