import { ReactNode } from 'react';

interface WriterLayoutProps {
  children: ReactNode;
}

export default function WriterLayout({ children }: WriterLayoutProps) {
  return <>{children}</>;
}
