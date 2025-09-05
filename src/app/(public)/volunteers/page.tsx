import ComingSoon from '@/components/shared/coming-soon';

export default function VolunteersPage() {
  return (
    <ComingSoon
      title="Volunteers"
      description="Join our dedicated team of volunteers who make CESAFI events and operations possible."
      features={[
        'Volunteer opportunities and roles',
        'How to become a volunteer',
        'Volunteer recognition and benefits',
        'Training and development programs',
        'Volunteer success stories'
      ]}
      estimatedLaunch="Q1 2025"
    />
  );
}
