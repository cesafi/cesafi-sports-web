'use client';

import { motion } from 'framer-motion';
// Removed unused React imports
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';
import { Article } from '@/lib/types/articles';

interface LatestNewsProps {
  initialArticles: Article[];
}

export default function LatestNews({ initialArticles }: LatestNewsProps) {
  const newsArticles = initialArticles.map((article, index) => ({
    id: article.id,
    title: article.title,
    excerpt: (article.content as { excerpt?: string })?.excerpt || 'Read more about this exciting update...',
    author: (article.content as { author?: string })?.author || 'CESAFI Media Team',
    publishedAt: article.created_at,
    category: (article.content as { category?: string })?.category || 'General',
    readTime: (article.content as { readTime?: string })?.readTime || '3 min read',
    image: (article.content as { image?: string })?.image || '/img/cesafi-banner.jpg',
    featured: (article.content as { featured?: boolean })?.featured || index === 0
  }));

  // Removed hydration handling as it's not needed

  const featuredArticle = newsArticles.find(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-8 leading-tight`}>
            LATEST
            <br />
            <span className="text-primary">NEWS</span>
          </h2>
          <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
            Stay updated with the latest happenings in CESAFI. 
            From championship victories to groundbreaking partnerships.
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl overflow-hidden border border-primary/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 lg:h-auto">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`${roboto.className} bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide`}>
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className={`${roboto.className} text-primary font-semibold text-sm uppercase tracking-wide`}>
                      {featuredArticle.category}
                    </span>
                  </div>
                  
                  <h3 className={`${roboto.className} text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-4 leading-tight`}>
                    {featuredArticle.title}
                  </h3>
                  
                  <p className={`${roboto.className} text-lg text-muted-foreground mb-6 leading-relaxed`}>
                    {featuredArticle.excerpt}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featuredArticle.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`${roboto.className} text-sm text-muted-foreground`}>
                      {featuredArticle.readTime}
                    </span>
                  </div>

                  <button className={`${roboto.className} bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3 w-fit`}>
                    Read Full Story
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-muted/30 rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                {/* Article Image */}
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`${roboto.className} bg-background/90 text-foreground px-2 py-1 rounded text-xs font-medium`}>
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h4 className={`${roboto.className} text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2`}>
                    {article.title}
                  </h4>
                  
                  <p className={`${roboto.className} text-muted-foreground mb-4 line-clamp-3`}>
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <span>{article.readTime}</span>
                  </div>

                  <button className={`${roboto.className} text-primary hover:text-primary/80 font-semibold text-sm uppercase tracking-wide transition-colors duration-200 flex items-center gap-2`}>
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All News Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className={`${roboto.className} bg-foreground hover:bg-foreground/90 text-background px-10 py-5 rounded-2xl font-semibold text-xl uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-lg`}>
            View All News
          </button>
        </motion.div>
      </div>
    </section>
  );
}