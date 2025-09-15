'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { roboto } from '@/lib/fonts';
import { Article } from '@/lib/types/articles';

interface NewsCardProps {
  article: Article;
  index: number;
  className?: string;
}

export default function NewsCard({ article, index, className = '' }: NewsCardProps) {
  // Transform article to match the expected format
  const newsArticle = {
    id: article.id,
    title: article.title,
    description: (article.content as { excerpt?: string })?.excerpt || 'Read more about this exciting update...',
    content: article.content,
    image: (article.content as { image?: string })?.image || '/img/cesafi-banner.jpg',
    publishedAt: article.published_at || article.created_at,
    author: (article.content as { author?: string })?.author || 'CESAFI Media Team',
    category: (article.content as { category?: string })?.category || 'General',
    readTime: (article.content as { readTime?: string })?.readTime || '3 min read'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group ${className}`}
    >
      <div className="bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        {/* Article Image */}
        <div className="relative h-48">
          <Image
            src={newsArticle.image}
            alt={newsArticle.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className={`${roboto.className} bg-background/90 text-foreground px-2 py-1 rounded text-xs font-medium`}>
              {newsArticle.category}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-6">
          <h4 className={`${roboto.className} text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2`}>
            {newsArticle.title}
          </h4>
          
          <p className={`${roboto.className} text-muted-foreground mb-4 line-clamp-3`}>
            {newsArticle.description}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{newsArticle.author}</span>
            </div>
            <span>{newsArticle.readTime}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(newsArticle.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <button className={`${roboto.className} text-primary hover:text-primary/80 font-semibold text-sm uppercase tracking-wide transition-colors duration-200 flex items-center gap-2`}>
            Read More
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
