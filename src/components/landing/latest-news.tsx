'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, User, ArrowRight, TrendingUp, Trophy, Users } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

// Mock news data - in production this would come from your articles database
const newsArticles = [
  {
    id: 1,
    title: 'CESAFI Basketball Championship Finals Set for Next Week',
    excerpt: 'The highly anticipated finals between University of San Carlos and University of Cebu will take place at the Cebu Coliseum.',
    content: 'Full article content here...',
    author: 'CESAFI Sports Desk',
    publishedAt: '2024-01-15',
    category: 'Basketball',
    image: '/img/cesafi-banner.jpg',
    featured: true,
    readTime: '3 min read'
  },
  {
    id: 2,
    title: 'New Swimming Records Set at CESAFI Aquatic Center',
    excerpt: 'Three new records were established during the swimming competition, showcasing the incredible talent of student-athletes.',
    content: 'Full article content here...',
    author: 'Aquatic Sports Reporter',
    publishedAt: '2024-01-14',
    category: 'Swimming',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    readTime: '2 min read'
  },
  {
    id: 3,
    title: 'CESAFI Football Tournament Kicks Off with Exciting Matches',
    excerpt: 'The opening matches of the football tournament delivered thrilling action and unexpected results.',
    content: 'Full article content here...',
    author: 'Football Correspondent',
    publishedAt: '2024-01-13',
    category: 'Football',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    readTime: '4 min read'
  },
  {
    id: 4,
    title: 'Track and Field Athletes Break Personal Bests',
    excerpt: 'Multiple athletes achieved new personal records in various track and field events during the weekend competition.',
    content: 'Full article content here...',
    author: 'Athletics Reporter',
    publishedAt: '2024-01-12',
    category: 'Athletics',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    readTime: '3 min read'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'basketball':
      return Trophy;
    case 'swimming':
      return TrendingUp;
    case 'football':
      return Users;
    default:
      return Trophy;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'basketball':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'swimming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'football':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'athletics':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function LatestNews() {
  const featuredArticle = newsArticles.find(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  return (
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl font-bold text-foreground mb-6`}>
            LATEST NEWS & UPDATES
          </h2>
          <p className={`${roboto.className} text-xl text-muted-foreground max-w-3xl mx-auto`}>
            Stay updated with the latest happenings, achievements, and stories from the CESAFI community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Article */}
          {featuredArticle && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <article className="bg-background rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-64 lg:h-80 overflow-hidden">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(featuredArticle.category)} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
                      <Trophy size={16} />
                      {featuredArticle.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      FEATURED
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className={`${moderniz.className} text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300`}>
                    {featuredArticle.title}
                  </h3>
                  
                  <p className={`${roboto.className} text-muted-foreground text-lg leading-relaxed mb-6`}>
                    {featuredArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{featuredArticle.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    
                    <button className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-200">
                      Read More
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            </motion.div>
          )}

          {/* Regular Articles */}
          <div className="space-y-6">
            {regularArticles.map((article, index) => {
              const CategoryIcon = getCategoryIcon(article.category);
              
              return (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex">
                    <div className="relative w-32 h-24 flex-shrink-0">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${getCategoryColor(article.category)} px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                          <CategoryIcon size={12} />
                          {article.category}
                        </span>
                      </div>
                      
                      <h4 className={`${moderniz.className} text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2`}>
                        {article.title}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* View All News Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className={`${moderniz.className} bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg uppercase tracking-wide transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-3 mx-auto`}>
            View All News
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}