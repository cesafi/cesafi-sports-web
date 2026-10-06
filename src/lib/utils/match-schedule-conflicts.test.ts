import { findMatchScheduleConflicts, ScheduledMatchSlot } from './match-schedule-conflicts';

// Team records are category-specific: USPF U15 and USPF College are different schools_teams rows.
const TEAMS = {
  USJR_U15: 'usjr-u15',
  DB_U15: 'db-u15',
  USPF_U15: 'uspf-u15',
  CEC_U15: 'cec-u15',
  USPF_COLLEGE: 'uspf-college',
  USJR_COLLEGE: 'usjr-college'
};

const at = (time: string) => `2026-10-10T${time}:00.000Z`;

const slot = (overrides: Partial<ScheduledMatchSlot>): ScheduledMatchSlot => ({
  id: 1,
  name: 'Match',
  venue: 'Gym A',
  scheduled_at: at('09:00'),
  end_at: at('10:00'),
  team_ids: [],
  ...overrides
});

describe('findMatchScheduleConflicts', () => {
  const collegeMatch = slot({
    id: 100,
    name: 'USPF vs USJR (College)',
    venue: 'USC Gym',
    team_ids: [TEAMS.USPF_COLLEGE, TEAMS.USJR_COLLEGE]
  });

  it('allows same time, different category, different venue (reported bug scenario)', () => {
    const u15a = slot({ id: 1, venue: 'USJR Gym', team_ids: [TEAMS.USJR_U15, TEAMS.DB_U15] });
    const u15b = slot({ id: 2, venue: 'CEC Gym', team_ids: [TEAMS.USPF_U15, TEAMS.CEC_U15] });
    expect(findMatchScheduleConflicts(u15a, [collegeMatch, u15b])).toEqual([]);
    expect(findMatchScheduleConflicts(u15b, [collegeMatch, u15a])).toEqual([]);
  });

  it('allows same time, same category, different venue, different teams', () => {
    const a = slot({ id: 1, venue: 'Gym A', team_ids: [TEAMS.USJR_U15, TEAMS.DB_U15] });
    const b = slot({ id: 2, venue: 'Gym B', team_ids: [TEAMS.USPF_U15, TEAMS.CEC_U15] });
    expect(findMatchScheduleConflicts(a, [b])).toEqual([]);
  });

  it('blocks same time, different category, same venue', () => {
    const u15 = slot({ id: 1, venue: 'USC Gym', team_ids: [TEAMS.USJR_U15, TEAMS.DB_U15] });
    const result = findMatchScheduleConflicts(u15, [collegeMatch]);
    expect(result).toHaveLength(1);
    expect(result[0].reasons).toEqual(['venue']);
  });

  it('blocks same time, same venue (venue compare ignores case/whitespace)', () => {
    const a = slot({ id: 1, venue: '  usc gym ' });
    expect(findMatchScheduleConflicts(a, [collegeMatch])[0].reasons).toEqual(['venue']);
  });

  it('blocks the same team record at an overlapping time, even at a different venue', () => {
    const a = slot({
      id: 1,
      venue: 'Other Gym',
      scheduled_at: at('09:30'),
      end_at: at('10:30'),
      team_ids: [TEAMS.USPF_COLLEGE, 'some-other-team']
    });
    const result = findMatchScheduleConflicts(a, [collegeMatch]);
    expect(result).toHaveLength(1);
    expect(result[0].reasons).toEqual(['team']);
  });

  it('allows same school name in a different category (different team ID) at a different venue', () => {
    const uspfU15 = slot({ id: 1, venue: 'Other Gym', team_ids: [TEAMS.USPF_U15, TEAMS.USJR_U15] });
    expect(findMatchScheduleConflicts(uspfU15, [collegeMatch])).toEqual([]);
  });

  it('allows back-to-back matches at the same venue (end == start)', () => {
    const before = slot({ id: 1, venue: 'USC Gym', scheduled_at: at('08:00'), end_at: at('09:00') });
    const after = slot({ id: 2, venue: 'USC Gym', scheduled_at: at('10:00'), end_at: at('11:00') });
    expect(findMatchScheduleConflicts(before, [collegeMatch])).toEqual([]);
    expect(findMatchScheduleConflicts(after, [collegeMatch])).toEqual([]);
  });

  it('allows back-to-back using the default duration when end_at is missing', () => {
    const a = slot({ id: 1, venue: 'Gym A', scheduled_at: at('09:00'), end_at: null });
    const b = slot({ id: 2, venue: 'Gym A', scheduled_at: at('09:30'), end_at: null });
    const c = slot({ id: 3, venue: 'Gym A', scheduled_at: at('09:29'), end_at: null });
    expect(findMatchScheduleConflicts(b, [a])).toEqual([]);
    expect(findMatchScheduleConflicts(c, [a])).toHaveLength(1);
  });

  it('does not let an updated match conflict with itself when its schedule is unchanged', () => {
    const self = { ...collegeMatch };
    expect(findMatchScheduleConflicts(self, [collegeMatch])).toEqual([]);
  });

  it('blocks updating a match into a real conflicting slot', () => {
    const moved = slot({
      id: 5,
      venue: 'USC Gym',
      scheduled_at: at('09:45'),
      end_at: at('10:45'),
      team_ids: [TEAMS.USJR_U15, TEAMS.DB_U15]
    });
    const result = findMatchScheduleConflicts(moved, [collegeMatch]);
    expect(result).toHaveLength(1);
    expect(result[0].match.id).toBe(100);
  });

  it('ignores matches without a schedule', () => {
    const unscheduled = slot({ id: 7, venue: 'USC Gym', scheduled_at: null });
    expect(findMatchScheduleConflicts(unscheduled, [collegeMatch])).toEqual([]);
    expect(findMatchScheduleConflicts(collegeMatch, [unscheduled])).toEqual([]);
  });
});
