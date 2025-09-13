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
  error?: string;
}

export default function AboutUsNewsClient({ news, error }: AboutUsNewsClientProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden" style={{ position: 'relative' }}>
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
          
          {error && (
            <div className={`${roboto.className} text-sm text-muted-foreground mt-4 max-w-2xl mx-auto`}>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="font-semibold text-destructive mb-2">Unable to load news</p>
                <p className="text-muted-foreground">{error}</p>
                {error.includes('Rate limit') && (
                  <p className="text-xs text-muted-foreground mt-2">
                    The free GNews API allows 100 requests per day. Please try again tomorrow.
                  </p>
                )}
              </div>
            </div>
          )}
          
          {!error && news.length === 0 && (
            <div className={`${roboto.className} text-sm text-muted-foreground mt-4 max-w-2xl mx-auto`}>
              <div className="bg-muted/50 rounded-lg p-4 text-xs">
                <p className="font-semibold mb-2">No CESAFI news found</p>
                <p className="text-muted-foreground">
                  No recent news articles about CESAFI were found. Check back later for updates.
                </p>
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
