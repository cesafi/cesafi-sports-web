import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PlayerProfile from '@/components/players/player-profile';
import { getPlayerBySlug } from '@/actions/players';

export const revalidate = 600; // Revalidate every 10 minutes

interface PlayerProfilePageProps {
  params: Promise<{
    playerSlug: string;
  }>;
}

export async function generateMetadata({ params }: PlayerProfilePageProps): Promise<Metadata> {
  const { playerSlug } = await params;
  const slug = decodeURIComponent(playerSlug);
  const result = await getPlayerBySlug(playerSlug);

  if (!result.success || !result.data) {
    return { title: 'Player Not Found | CESAFI Sports' };
  }

  const player = result.data as any;
  const name = player.first_name ? `${player.first_name} ${player.last_name}` : slug;
  const school = player.schools_teams?.school?.abbreviation || '';

  return {
    title: `${name}${school ? ` - ${school}` : ''} | CESAFI Sports`,
    description: `View ${name}'s player profile, stats, and match history in CESAFI Sports.`,
  };
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { playerSlug } = await params;

  if (!playerSlug) {
    notFound();
  }

  return <PlayerProfile playerSlug={decodeURIComponent(playerSlug)} />;
}
