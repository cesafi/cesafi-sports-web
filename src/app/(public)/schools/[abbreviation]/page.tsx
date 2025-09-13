import { notFound } from 'next/navigation';
import SchoolProfile from '@/components/schools/school-profile';

interface SchoolProfilePageProps {
  params: Promise<{
    abbreviation: string;
  }>;
}

export default async function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  const { abbreviation } = await params;

  if (!abbreviation) {
    notFound();
  }

  return <SchoolProfile schoolAbbreviation={abbreviation} />;
}
