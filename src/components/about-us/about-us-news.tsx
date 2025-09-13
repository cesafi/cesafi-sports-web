import { getCESAFINews } from '@/actions/news';
import AboutUsNewsClient from './about-us-news-client';

export default async function AboutUsNews() {
  // Fetch news server-side using the new service structure
  const result = await getCESAFINews();
  
  if (!result.success) {
    console.error('Failed to fetch news:', result.error);
    return <AboutUsNewsClient news={[]} error={result.error} />;
  }

  const news = result.data;
  return <AboutUsNewsClient news={news} />;
}
