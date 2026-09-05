-- Add '12_under' and '15_under' values to sport_levels enum
ALTER TYPE "public"."sport_levels" ADD VALUE IF NOT EXISTS '12_under';--> statement-breakpoint
ALTER TYPE "public"."sport_levels" ADD VALUE IF NOT EXISTS '15_under';
