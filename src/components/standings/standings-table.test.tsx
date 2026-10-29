import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { StandingsTable } from './standings-table';
import type { CategoryStandings, RankedTeamStanding } from '@/lib/types/standings';

const team = (
  teamId: string,
  teamName: string,
  schoolName: string,
  wins: number,
  losses: number,
  rank: number | null,
  logoUrl: string | null = null,
  pointDiff = 0
): RankedTeamStanding => ({
  teamId,
  teamName,
  school: { id: `school-${teamId}`, name: schoolName, abbreviation: teamId.toUpperCase(), logoUrl },
  starting: { wins, losses, pointDiff },
  fromMatches: { wins: 0, losses: 0, pointDiff: 0 },
  wins,
  losses,
  pointDiff,
  points: 3 * wins,
  rank,
  updatedAt: null
});

const category = (teams: RankedTeamStanding[], hasResults = true): CategoryStandings => ({
  category: { id: 3, sportName: 'Basketball', division: 'men', levels: 'college', name: "Basketball · Men's College" },
  countedThrough: null,
  hasResults,
  teams
});

describe('StandingsTable', () => {
  it('renders a captioned table with #, Team, W, L, PTS and +/- columns', () => {
    render(<StandingsTable category={category([team('uc', 'Webmasters', 'University of Cebu', 5, 1, 1)])} />);

    const table = screen.getByRole('table', { name: "Basketball · Men's College" });
    const headers = within(table).getAllByRole('columnheader');
    headers.forEach((th) => expect(th).toHaveAccessibleName());
    expect(headers.map((th) => th.querySelector('[aria-hidden="true"]')?.textContent ?? th.textContent)).toEqual([
      '#',
      'Team',
      'W',
      'L',
      'PTS',
      '+/\u2212'
    ]);
    expect(
      ['Rank', 'Team', 'Wins', 'Losses', 'Points', 'Point difference'].map(
        (name) => within(table).getByRole('columnheader', { name }).tagName
      )
    ).toEqual(['TH', 'TH', 'TH', 'TH', 'TH', 'TH']);
  });

  it('shows points and a signed point difference', () => {
    render(
      <StandingsTable
        category={category([
          team('bc', 'Cheetahs', 'University of Baguio', 9, 1, 1, null, 100),
          team('usjr', 'Jaguars', 'University of San Jose-Recoletos', 5, 4, 2, null, -1),
          team('uc', 'Webmasters', 'University of Cebu', 0, 0, 3, null, 0)
        ])}
      />
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell').slice(2).map((cell) => cell.textContent))).toEqual([
      ['9', '1', '27', '+100'],
      ['5', '4', '15', '\u22121'],
      ['0', '0', '0', '0']
    ]);
  });

  it('lists teams in the given order with their rank, wins and losses', () => {
    render(
      <StandingsTable
        category={category([
          team('uc', 'Webmasters', 'University of Cebu', 5, 1, 1),
          team('usjr', 'Jaguars', 'University of San Jose-Recoletos', 5, 1, 1),
          team('swu', 'Cobras', 'Southwestern University', 2, 4, 3)
        ])}
      />
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent?.trim()))).toEqual([
      ['1', 'WebmastersUCUniversity of Cebu', '5', '1', '15', '0'],
      ['1', 'JaguarsUSJRUniversity of San Jose-Recoletos', '5', '1', '15', '0'],
      ['3', 'CobrasSWUSouthwestern University', '2', '4', '6', '0']
    ]);
  });

  it('shows "No results recorded yet" and unranked dashes when nobody has played', () => {
    render(
      <StandingsTable
        category={category(
          [team('cit', 'Wildcats', 'Cebu Institute of Technology', 0, 0, null), team('uc', 'Webmasters', 'University of Cebu', 0, 0, null)],
          false
        )}
      />
    );

    expect(screen.getByText('No results recorded yet')).toBeInTheDocument();
    const dashes = screen.getAllByLabelText('Not ranked yet');
    expect(dashes).toHaveLength(2);
    dashes.forEach((dash) => expect(dash).toHaveTextContent('–'));
  });

  it('uses the CESAFI logo when a school has no logo', () => {
    render(<StandingsTable category={category([team('uc', 'Webmasters', 'University of Cebu', 5, 1, 1, null)])} />);

    expect(screen.getByAltText('University of Cebu').getAttribute('src')).toContain('cesafi-logo.webp');
  });

  it('shows each school abbreviation so same-named teams stay distinguishable on phones', () => {
    render(
      <StandingsTable
        category={category([
          team('uclm', 'Webmasters', 'University of Cebu Lapu-Lapu and Mandaue', 0, 0, 1),
          team('uc', 'Webmasters', 'University of Cebu Main', 0, 0, 1)
        ])}
      />
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('UCLM')).toBeInTheDocument();
    expect(within(rows[1]).getByText('UC')).toBeInTheDocument();
  });

  it('shows the team count in the header', () => {
    render(<StandingsTable category={category([team('uc', 'Webmasters', 'University of Cebu', 5, 1, 1)])} />);

    expect(screen.getByText('1 Team')).toBeInTheDocument();
  });
});
