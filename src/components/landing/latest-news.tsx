'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

// Mock news data - in production this would come from your articles database
const newsArticles = [
  {
    id: 1,
    title: 'CESAFI Season 2024 Kicks Off with Record-Breaking Opening Ceremony',
    excerpt: 'The Cebu Schools Athletic Foundation officially launched its 2024 season with an unprecedented opening ceremony featuring over 5,000 student-athletes from 8 member schools.',
    author: 'CESAFI Media Team',
    publishedAt: '2024-01-15',
    category: 'Season Updates',
    readTime: '5 min read',
    image: '/img/cesafi-banner.jpg',
    featured: true
  },
  {
    id: 2,
    title: 'USC Warriors Dominate Basketball Championship Finals',
    excerpt: 'The University of San Carlos Warriors secured their third consecutive basketball championship with a thrilling 89-85 victory over the University of Cebu Webmasters.',
    author: 'Sports Reporter',
    publishedAt: '2024-01-12',
    category: 'Basketball',
    readTime: '3 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false
  },
  {
    id: 3,
    title: 'New Athletic Facilities Open at Cebu Sports Complex',
    excerpt: 'State-of-the-art training facilities and upgraded courts are now available for all CESAFI member schools, promising enhanced training experiences for student-athletes.',
    author: 'Facilities Team',
    publishedAt: '2024-01-10',
    category: 'Facilities',
    readTime: '4 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false
  },
  {
    id: 4,
    title: 'CESAFI Announces Partnership with Major Sports Brands',
    excerpt: 'New partnerships with leading sports equipment manufacturers will provide better gear and training resources for all participating schools and athletes.',
    author: 'Partnership Team',
    publishedAt: '2024-01-08',
    category: 'Partnerships',
    readTime: '3 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false
  }
];

export default function LatestNews() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const featuredArticle = newsArticles.find(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Parallax */}
        <motion.div
          style={{ y, opacity }}
          className="text-center mb-20"
        >
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-8 leading-tight`}>
            LATEST
            <br />
            <span className="text-primary">NEWS</span>
          </h2>
          <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
            Stay updated with the latest happenings in CESAFI. 
            From championship victories to groundbreaking partnerships.
          </p>
        </motion.div>

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