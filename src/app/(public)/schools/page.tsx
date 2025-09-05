import ComingSoon from '@/components/shared/coming-soon';

export default function SchoolsPage() {
  return (
    <ComingSoon
      title="Member Schools"
      description="Discover the 17 prestigious educational institutions that make up the CESAFI community."
      features={[
        'Complete school profiles and information',
        'Team rosters and player statistics',
        'School achievements and history',
        'Contact information and locations',
        'School-specific news and updates'
      ]}
      estimatedLaunch="Q1 2025"
    />
  );
}
