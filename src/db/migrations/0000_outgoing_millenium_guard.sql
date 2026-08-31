CREATE TYPE "public"."article_status" AS ENUM('review', 'published', 'revise', 'cancelled', 'approved', 'draft');--> statement-breakpoint
CREATE TYPE "public"."competition_stage" AS ENUM('group_stage', 'playins', 'playoffs', 'finals');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('upcoming', 'ongoing', 'finished', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sponsor_type" AS ENUM('title', 'venue', 'event');--> statement-breakpoint
CREATE TYPE "public"."sport_divisions" AS ENUM('men', 'women', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."sport_levels" AS ENUM('elementary', 'high_school', 'college');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('admin', 'head_writer', 'league_operator', 'writer');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"cover_image_url" text NOT NULL,
	"published_at" timestamp with time zone,
	"status" "article_status" DEFAULT 'review' NOT NULL,
	"authored_by" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"viewer_ip" text,
	"viewer_session" text,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cesafi_timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"year" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"is_highlight" boolean DEFAULT false NOT NULL,
	"image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_open" boolean NOT NULL,
	"display_order" smallint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"is_highlight" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_scores" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"score" smallint NOT NULL,
	"id" bigserial PRIMARY KEY NOT NULL,
	"match_participant_id" bigint NOT NULL,
	"game_id" bigint
);
--> statement-breakpoint
CREATE TABLE "game_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"game_id" bigint NOT NULL,
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"is_mvp" boolean DEFAULT false NOT NULL,
	"stat1" real,
	"stat2" real,
	"stat3" real,
	"stat4" real,
	"stat5" real,
	"stat6" real,
	"stat7" real,
	"stat8" real,
	"stat9" real,
	"stat10" real,
	"stat11" real,
	"stat12" real,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "games" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"game_number" smallint DEFAULT 1 NOT NULL,
	"duration" text DEFAULT '00:00' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"match_id" bigint NOT NULL,
	"id" bigserial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_section_live" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"video_link" text NOT NULL,
	"end_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_participants" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"match_id" bigint NOT NULL,
	"team_id" uuid NOT NULL,
	"id" bigserial PRIMARY KEY NOT NULL,
	"match_score" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scheduled_at" timestamp with time zone,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"best_of" smallint DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"id" bigserial PRIMARY KEY NOT NULL,
	"stage_id" bigint NOT NULL,
	"venue" text NOT NULL,
	"status" "match_status" DEFAULT 'upcoming' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"photo_url" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"caption" text NOT NULL,
	"photo_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"player_id" uuid NOT NULL,
	"season_id" integer NOT NULL,
	"stage_id" bigint,
	"school_team_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"player_number" integer,
	"position" text,
	"photo_url" text,
	"school_team_id" uuid NOT NULL,
	"sport_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"slug" text NOT NULL,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"abbreviation" text DEFAULT '' NOT NULL,
	"logo_url" text DEFAULT '',
	"is_active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"school_id" uuid NOT NULL,
	"sport_category_id" integer NOT NULL,
	"season_id" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"logo_url" text,
	"dark_logo_url" text,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"type" "sponsor_type",
	"display_order" smallint,
	"is_active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sport_stat_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sport_id" integer NOT NULL,
	"stat_column" varchar(20) NOT NULL,
	"label" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_categories" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"division" "sport_divisions" NOT NULL,
	"levels" "sport_levels" NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"sport_id" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_seasons_stages" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"competition_stage" "competition_stage" NOT NULL,
	"id" bigserial PRIMARY KEY NOT NULL,
	"season_id" smallint,
	"sport_category_id" integer
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"image_url" text,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"season_id" smallint,
	"is_active" boolean,
	"department_id" smallint
);
--> statement-breakpoint
ALTER TABLE "sport_stat_mappings" ADD CONSTRAINT "sport_stat_mappings_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;