import { pgEnum } from 'drizzle-orm/pg-core';

export const articleStatusEnum = pgEnum('article_status', ['review', 'published', 'revise', 'cancelled', 'approved', 'draft']);
export const competitionStageEnum = pgEnum('competition_stage', ['group_stage', 'playins', 'playoffs', 'finals']);
export const matchStatusEnum = pgEnum('match_status', ['upcoming', 'ongoing', 'finished', 'cancelled']);
export const sportDivisionsEnum = pgEnum('sport_divisions', ['men', 'women', 'mixed']);
export const sportLevelsEnum = pgEnum('sport_levels', ['elementary', 'high_school', 'college']);
export const userRolesEnum = pgEnum('user_roles', ['admin', 'head_writer', 'league_operator', 'writer']);
export const sponsorTypeEnum = pgEnum('sponsor_type', ['title', 'venue', 'event']);

export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];
export type CompetitionStage = (typeof competitionStageEnum.enumValues)[number];
export type MatchStatus = (typeof matchStatusEnum.enumValues)[number];
export type SportDivision = (typeof sportDivisionsEnum.enumValues)[number];
export type SportLevel = (typeof sportLevelsEnum.enumValues)[number];
export type UserRole = (typeof userRolesEnum.enumValues)[number];
export type SponsorType = (typeof sponsorTypeEnum.enumValues)[number];
