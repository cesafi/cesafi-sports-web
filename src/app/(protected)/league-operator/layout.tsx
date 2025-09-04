import { ReactNode } from 'react';

interface LeagueOperatorLayoutProps {
  children: ReactNode;
}

export default function LeagueOperatorLayout({ children }: LeagueOperatorLayoutProps) {
  return <>{children}</>;
}
