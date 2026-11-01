import { Metadata } from 'next';
import { getArticleBySlug } from '@/actions/articles';
import { generateMetaDescription } from '@/lib/utils/content-renderer';
import { getArticleUrl } from '@/lib/utils/site-url';

interface ArticleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticleLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticleBySlug(slug);

  if (!result.success || !result.data) {
    return { title: 'Article Not Found | CESAFI Sports' };
  }

  const article = result.data;
  const url = getArticleUrl(slug);
  const image = article.cover_image_url || '/img/cesafi-banner.jpg';
  const description =
    (article.content as any)?.excerpt ||
    generateMetaDescription(article.content) ||
    `Read "${article.title}" on the CESAFI Sports news page.`;

  return {
    title: `${article.title} | CESAFI Sports`,
    description,
    // Override the site-wide canonical and cards so share previews show this article
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: 'CESAFI Sports',
      images: [{ url: image }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [image],
    },
  };
}

export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return <>{children}</>;
}
