import { getCESAFINews } from '@/actions/news';
import AboutUsNewsClient from '../about-us/about-us-news-client';

export default async function AboutUsNews() {
  // Fetch news server-side using the new service structure
  const result = await getCESAFINews();
  
  if (!result.success) {
    console.error('Failed to fetch news:', result.error);
    // Fallback to empty array if service fails
    return <AboutUsNewsClient news={[]} isUsingFallback={true} />;
  }

  const news = result.data;
  const isUsingFallback = news.length > 0 && news[0].id.startsWith('fallback-');

  return <AboutUsNewsClient news={news} isUsingFallback={isUsingFallback} />;
}
