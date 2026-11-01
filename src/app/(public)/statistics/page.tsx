import type { Metadata } from 'next';
import ComingSoon from '@/components/shared/coming-soon';

export const metadata: Metadata = {
  alternates: { canonical: '/statistics' },
};

export default function StatisticsPage() {
  return (
    <div className="container mx-auto py-12">
      <ComingSoon 
        title="Public Statistics" 
        description="Public view for sports statistics is coming soon." 
      />
    </div>
  );
}
