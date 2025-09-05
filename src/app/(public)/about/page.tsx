import ComingSoon from '@/components/shared/coming-soon';

export default function AboutPage() {
  return (
    <ComingSoon
      title="About CESAFI"
      description="Learn about the Cebu Schools Athletic Foundation, Inc. and our mission to promote excellence in collegiate sports."
      features={[
        'Our mission, vision, and values',
        'CESAFI history and milestones',
        'Leadership and organizational structure',
        'Contact information and office locations',
        'Frequently asked questions'
      ]}
      estimatedLaunch="Q1 2025"
    />
  );
}
