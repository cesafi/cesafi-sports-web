import { db } from '../db';
import { eq } from 'drizzle-orm';
import { sportStatMappings, SportStatMapping, NewSportStatMapping } from '../db/schema/sport-stat-mappings';
import { ServiceResponse } from '../lib/types/base';
import { BaseService } from './base';

export class StatisticsService extends BaseService {
  /**
   * Get all stat mappings for a specific sport
   */
  async getSportStatMappings(sportId: number): Promise<ServiceResponse<SportStatMapping[]>> {
    try {
      const mappings = await db
        .select()
        .from(sportStatMappings)
        .where(eq(sportStatMappings.sport_id, sportId));

      return { success: true, data: mappings };
    } catch (error) {
      return BaseService.formatError(error, 'Failed to fetch sport stat mappings');
    }
  }

  /**
   * Overwrite stat mappings for a specific sport
   */
  async updateSportStatMappings(
    sportId: number,
    mappings: Array<{ stat_column: string; label: string }>
  ): Promise<ServiceResponse<SportStatMapping[]>> {
    try {
      return await db.transaction(async (tx) => {
        // Delete existing mappings
        await tx
          .delete(sportStatMappings)
          .where(eq(sportStatMappings.sport_id, sportId));

        // Insert new mappings if any
        if (mappings.length > 0) {
          const insertData: NewSportStatMapping[] = mappings.map(m => ({
            sport_id: sportId,
            stat_column: m.stat_column,
            label: m.label,
          }));
          
          await tx.insert(sportStatMappings).values(insertData);
        }

        // Return updated mappings
        const updated = await tx
          .select()
          .from(sportStatMappings)
          .where(eq(sportStatMappings.sport_id, sportId));

        return { success: true, data: updated };
      });
    } catch (error) {
      return BaseService.formatError(error, 'Failed to update sport stat mappings');
    }
  }
}

export const getSportStatMappings = (sportId: number) => new StatisticsService().getSportStatMappings(sportId);
export const updateSportStatMappings = (sportId: number, mappings: Array<{ stat_column: string; label: string }>) => 
  new StatisticsService().updateSportStatMappings(sportId, mappings);
