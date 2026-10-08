process.env.TZ = 'Asia/Manila';

import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import ScheduleCalendarView from './schedule-calendar-view';
import { ScheduleMatch } from '@/lib/types/matches';

jest.mock('@/lib/fonts', () => ({ roboto: { className: '' } }));
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />
}));

const match = (id: number, scheduledAt: string, home: string, away: string, utcDisplayTime: string) =>
  ({
    id,
    scheduled_at: scheduledAt,
    status: 'upcoming',
    // What a UTC server (Vercel) used to send: wall-clock time in UTC, not the viewer's
    displayTime: utcDisplayTime,
    sports_seasons_stages: { sports_categories: { sports: { name: 'Basketball' } } },
    match_participants: [
      { schools_teams: { school: { abbreviation: home } } },
      { schools_teams: { school: { abbreviation: away } } }
    ]
  }) as unknown as ScheduleMatch;

const dayCell = (day: string) => screen.getAllByText(day, { exact: true })[0].closest('div.relative') as HTMLElement;

describe('ScheduleCalendarView match times', () => {
  it('shows each match at its saved time in the viewer timezone, not the server timezone', () => {
    render(
      <ScheduleCalendarView
        currentDate={new Date(2026, 9, 1)}
        matches={[
          match(1, '2026-10-10T01:00:00.000Z', 'USJR', 'DB', '01:00 AM'),
          match(2, '2026-10-10T10:30:00.000Z', 'USPF', 'CEC', '10:30 AM'),
          match(3, '2026-10-10T07:45:00.000Z', 'USC', 'UC', '07:45 AM')
        ]}
      />
    );

    const cell = dayCell('10');
    expect(within(cell).getByText('09:00 AM')).toBeInTheDocument();
    expect(within(cell).getByText('06:30 PM')).toBeInTheDocument();
    expect(within(cell).getByText('03:45 PM')).toBeInTheDocument();
    expect(within(cell).queryByText('10:30 AM')).not.toBeInTheDocument();
  });

  it('places a match just after local midnight on the next day with the matching time', () => {
    render(
      <ScheduleCalendarView
        currentDate={new Date(2026, 9, 1)}
        matches={[match(4, '2026-10-10T16:30:00.000Z', 'SWU', 'UV', '04:30 PM')]}
      />
    );

    expect(within(dayCell('11')).getByText('12:30 AM')).toBeInTheDocument();
    expect(within(dayCell('11')).getByText('SWU vs UV')).toBeInTheDocument();
    expect(within(dayCell('10')).queryByText('SWU vs UV')).not.toBeInTheDocument();
  });

  it('follows a rescheduled match to its new time', () => {
    const { rerender } = render(
      <ScheduleCalendarView currentDate={new Date(2026, 9, 1)} matches={[match(5, '2026-10-10T10:15:00.000Z', 'UC', 'USC', '10:15 AM')]} />
    );
    expect(within(dayCell('10')).getByText('06:15 PM')).toBeInTheDocument();

    rerender(
      <ScheduleCalendarView currentDate={new Date(2026, 9, 1)} matches={[match(5, '2026-10-10T11:45:00.000Z', 'UC', 'USC', '10:15 AM')]} />
    );
    expect(within(dayCell('10')).getByText('07:45 PM')).toBeInTheDocument();
    expect(within(dayCell('10')).queryByText('06:15 PM')).not.toBeInTheDocument();
  });
});
