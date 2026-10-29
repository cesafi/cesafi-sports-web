import { pickDefaultSeasonId, resolveCategoryId, resolveSeasonId } from './standings-selection';
import type { CategoryStandings } from '@/lib/types/standings';

const SEASONS = [
  { id: 25, start_at: '2025-08-01T00:00:00+00:00', end_at: '2026-03-31T00:00:00+00:00' },
  { id: 26, start_at: '2026-08-01T00:00:00+00:00', end_at: '2027-03-31T00:00:00+00:00' }
];

const category = (id: number): CategoryStandings => ({
  category: { id, sportName: 'Basketball', division: 'men', levels: 'college', name: `Category ${id}` },
  countedThrough: null,
  hasResults: false,
  teams: []
});

describe('pickDefaultSeasonId', () => {
  it('picks the season whose dates contain today, even if it is not the latest', () => {
    expect(pickDefaultSeasonId(SEASONS, new Date('2025-10-01T00:00:00Z'))).toBe(25);
    expect(pickDefaultSeasonId(SEASONS, new Date('2026-10-22T00:00:00Z'))).toBe(26);
  });

  it('falls back to the latest start when no season contains today', () => {
    expect(pickDefaultSeasonId(SEASONS, new Date('2026-05-01T00:00:00Z'))).toBe(26);
  });

  it('returns null when there are no seasons', () => {
    expect(pickDefaultSeasonId([], new Date())).toBeNull();
  });
});

describe('resolveSeasonId', () => {
  const now = new Date('2026-10-22T00:00:00Z');

  it('keeps a requested season that exists', () => {
    expect(resolveSeasonId(SEASONS, 25, now)).toBe(25);
  });

  it.each([999, undefined])('uses the default for %p', (requested) => {
    expect(resolveSeasonId(SEASONS, requested, now)).toBe(26);
  });
});

describe('resolveCategoryId', () => {
  const categories = [category(3), category(9)];

  it('keeps a requested category that has teams', () => {
    expect(resolveCategoryId(categories, 9)).toBe(9);
  });

  it.each([7, undefined])('falls back to All (null) for %p', (requested) => {
    expect(resolveCategoryId(categories, requested)).toBeNull();
  });
});
