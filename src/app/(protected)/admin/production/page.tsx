import ComingSoon from '@/components/shared/coming-soon';

export default function AdminProductionPage() {
  return (
    <ComingSoon
      title="Production Hub"
      description="Track and manage production workflows, analytics, and team performance."
      features={[
        'Production analytics dashboard',
        'Team performance metrics',
        'Workflow management tools',
        'Content production tracking'
      ]}
    />
  );
}
