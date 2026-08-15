import ComingSoon from '@/components/shared/coming-soon';

export default function HeadWriterProductionPage() {
  return (
    <ComingSoon
      title="Production Hub"
      description="Track and manage content production workflows and team performance."
      features={[
        'Content production tracking',
        'Writer performance metrics',
        'Editorial workflow management',
        'Publishing analytics'
      ]}
    />
  );
}
