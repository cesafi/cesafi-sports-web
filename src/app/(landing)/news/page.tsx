'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArticleCard } from '@/components';
import { moderniz, roboto } from '@/lib/fonts';

// Mock news data - in production this would come from your articles database
const newsArticles = [
  {
    id: '1',
    title: 'CESAFI Season 2024 Kicks Off with Record-Breaking Opening Ceremony',
    excerpt: 'The Cebu Schools Athletic Foundation officially launched its 2024 season with an unprecedented opening ceremony featuring over 5,000 student-athletes from 8 member schools.',
    author: 'CESAFI Media Team',
    publishedAt: '2024-01-15',
    category: 'Season Updates',
    readTime: '5 min read',
    image: '/img/cesafi-banner.jpg',
    featured: true,
    slug: 'cesafi-season-2024-opening-ceremony'
  },
  {
    id: '2',
    title: 'USC Warriors Dominate Basketball Championship Finals',
    excerpt: 'The University of San Carlos Warriors secured their third consecutive basketball championship with a thrilling 89-85 victory over the University of Cebu Webmasters.',
    author: 'Sports Reporter',
    publishedAt: '2024-01-12',
    category: 'Basketball',
    readTime: '3 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    slug: 'usc-warriors-basketball-championship'
  },
  {
    id: '3',
    title: 'New Athletic Facilities Open at Cebu Sports Complex',
    excerpt: 'State-of-the-art training facilities and upgraded courts are now available for all CESAFI member schools, promising enhanced training experiences for student-athletes.',
    author: 'Facilities Team',
    publishedAt: '2024-01-10',
    category: 'Facilities',
    readTime: '4 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    slug: 'new-athletic-facilities-cebu-sports-complex'
  },
  {
    id: '4',
    title: 'CESAFI Announces Partnership with Major Sports Brands',
    excerpt: 'New partnerships with leading sports equipment manufacturers will provide better gear and training resources for all participating schools and athletes.',
    author: 'Partnership Team',
    publishedAt: '2024-01-08',
    category: 'Partnerships',
    readTime: '4 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    slug: 'cesafi-sports-brand-partnerships'
  },
  {
    id: '5',
    title: 'Student-Athletes Excel in Academic Performance',
    excerpt: 'CESAFI member schools report highest academic achievement rates among student-athletes, showcasing the perfect balance of sports and education.',
    author: 'Academic Affairs',
    publishedAt: '2024-01-05',
    category: 'Academics',
    readTime: '3 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    slug: 'student-athletes-academic-excellence'
  },
  {
    id: '6',
    title: 'Volleyball Championship Delivers Thrilling Matches',
    excerpt: 'The women\'s volleyball championship showcased incredible talent and sportsmanship, with several matches going to decisive fifth sets.',
    author: 'Volleyball Reporter',
    publishedAt: '2024-01-03',
    category: 'Volleyball',
    readTime: '4 min read',
    image: '/img/cesafi-banner.jpg',
    featured: false,
    slug: 'volleyball-championship-thrilling-matches'
  }
];

const categories = ['All', 'Season Updates', 'Basketball', 'Volleyball', 'Facilities', 'Partnerships', 'Academics'];

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles.find(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-24 pb-16">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM2YzYxIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className={`${moderniz.className} text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6`}>
              Latest <span className="text-primary">News</span>
            </h1>
            <p className={`${roboto.className} text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8`}>
              Stay updated with the latest news, updates, and highlights from CESAFI sports events and member schools.
            </p>

            {/* Category Filters - Centered */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar - Side positioned */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            {searchTerm.trim() && (
              <h2 className={`${moderniz.className} text-2xl font-bold text-foreground`}>
                All Articles
              </h2>
            )}
            <div className={`relative ${searchTerm.trim() ? 'w-full sm:w-80' : 'w-full sm:w-80 sm:ml-auto'}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background/80 backdrop-blur-sm border-border/30"
              />
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className={`${roboto.className} text-muted-foreground text-lg`}>
                No articles found matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Article */}
              {featuredArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className={`${moderniz.className} text-2xl font-bold text-foreground mb-8`}>
                    Featured Story
                  </h2>
                  <ArticleCard article={featuredArticle} variant="featured" />
                </motion.div>
              )}

              {/* Regular Articles Grid */}
              {regularArticles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h2 className={`${moderniz.className} text-2xl font-bold text-foreground mb-8`}>
                    Recent Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularArticles.map((article, index) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        variant="default"
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
