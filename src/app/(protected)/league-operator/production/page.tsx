import ComingSoon from '@/components/shared/coming-soon';

export default function LeagueOperatorProductionPage() {
  return (
    <ComingSoon
      title="Production Hub"
      description="Track and manage match production workflows and broadcast operations."
      features={[
        'Match production tracking',
        'Broadcast operations dashboard',
        'Production schedule management',
        'Live event analytics'
      ]}
    />
  );
}
