import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/about-us' },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
