'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  lang: string;
  source: {
    id: string;
    name: string;
    url: string;
    country: string;
  };
}

interface AboutUsNewsClientProps {
  news: NewsArticle[];
  isUsingFallback: boolean;
}

export default function AboutUsNewsClient({ news, isUsingFallback }: AboutUsNewsClientProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          style={{ y, opacity }}
          className="text-center mb-20"
        >
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-8 leading-tight`}>
            CESAFI IN THE
            <br />
            <span className="text-primary">NEWS</span>
          </h2>
          
          {isUsingFallback && (
            <div className={`${roboto.className} text-sm text-muted-foreground mt-4 max-w-2xl mx-auto`}>
              <p className="mb-2">Using sample data. Add GNews API key for real news.</p>
              <div className="bg-muted/50 rounded-lg p-4 text-xs">
                <p className="font-semibold mb-2">To enable real news:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Get a free API key from <a href="https://gnews.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GNews.io</a></li>
                  <li>Create a <code className="bg-muted px-1 rounded">.env.local</code> file in your project root</li>
                  <li>Add: <code className="bg-muted px-1 rounded">GNEWS_API_KEY=your-key-here</code></li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
          )}
        </motion.div>

        {/* News Grid - Clean Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                {/* Article Image */}
                <div className="relative h-48">
                  <Image
                    src={article.image || '/img/cesafi-banner.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to default image if external image fails
                      e.currentTarget.src = '/img/cesafi-banner.jpg';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <ExternalLink className="w-4 h-4 text-white/80" />
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h4 className={`${moderniz.className} text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2`}>
                    {article.title}
                  </h4>
                  
                  {article.description && (
                    <p className={`${roboto.className} text-sm text-muted-foreground mb-4 line-clamp-2`}>
                      {article.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{article.source.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {article.url !== '#' && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${roboto.className} text-primary hover:text-primary/80 font-semibold text-sm uppercase tracking-wide transition-colors duration-200 flex items-center gap-2 mt-3`}
                    >
                      Read Full Article
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
