'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Twitter, Facebook, Link as LinkIcon, Trophy, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShareButtons, MoreArticles } from '@/components';
import { moderniz, roboto } from '@/lib/fonts';
import { toast } from 'sonner';

// Mock article data - in production this would come from your database
const mockArticle = {
  id: '1',
  title: 'CESAFI Season 2024 Kicks Off with Record-Breaking Opening Ceremony',
  slug: 'cesafi-season-2024-opening-ceremony',
  excerpt: 'The Cebu Schools Athletic Foundation officially launched its 2024 season with an unprecedented opening ceremony featuring over 5,000 student-athletes from 8 member schools.',
  content: `
    <p>The Cebu Schools Athletic Foundation (CESAFI) officially launched its highly anticipated 2024 season with a spectacular opening ceremony that broke all previous attendance records. The event, held at the Cebu Coliseum, witnessed an unprecedented gathering of over 5,000 student-athletes representing all 8 member schools.</p>

    <h2>A Celebration of Athletic Excellence</h2>
    <p>The ceremony began with a grand parade of athletes, each school proudly displaying their colors and banners. The atmosphere was electric as supporters filled every corner of the venue, creating a sea of school colors and enthusiastic cheers that echoed throughout the coliseum.</p>

    <p>"This opening ceremony represents more than just the start of a sports season," said CESAFI Commissioner Maria Santos during her opening remarks. "It symbolizes our commitment to developing not just exceptional athletes, but well-rounded individuals who will become tomorrow's leaders."</p>

    <h2>Impressive Participation Numbers</h2>
    <p>This year's season sees record participation across all sporting categories:</p>
    <ul>
      <li>Basketball: 16 teams (8 men's, 8 women's)</li>
      <li>Volleyball: 16 teams (8 men's, 8 women's)</li>
      <li>Football: 12 teams (8 men's, 4 women's)</li>
      <li>Swimming: 200+ individual athletes</li>
      <li>Track and Field: 300+ individual athletes</li>
      <li>Chess: 64 participants</li>
    </ul>

    <h2>New Initiatives for 2024</h2>
    <p>CESAFI announced several exciting new initiatives for the 2024 season, including:</p>
    <ul>
      <li>Enhanced live streaming coverage for all major events</li>
      <li>New scholarship programs for outstanding student-athletes</li>
      <li>Partnerships with local sports medicine clinics for athlete health</li>
      <li>Introduction of esports competitions alongside traditional sports</li>
    </ul>

    <h2>Looking Ahead</h2>
    <p>The season officially begins next week with preliminary basketball games. All events will be held across various venues in Cebu, with the championship games returning to the historic Cebu Coliseum.</p>

    <p>Fans can expect an action-packed season filled with intense competition, outstanding sportsmanship, and the celebration of academic-athletic excellence that CESAFI is known for.</p>

    <p><em>For complete schedules and ticket information, visit the official CESAFI website or follow our social media channels for real-time updates.</em></p>
  `,
  author: 'CESAFI Media Team',
  publishedAt: '2024-01-15',
  updatedAt: '2024-01-15',
  category: 'Season Updates',
  readTime: '5 min read',
  image: '/img/cesafi-banner.jpg',
  tags: ['CESAFI', 'Opening Ceremony', '2024 Season', 'Student Athletes', 'Sports']
};

// Mock related articles
const relatedArticles = [
  {
    id: '2',
    title: 'USC Warriors Dominate Basketball Championship Finals',
    slug: 'usc-warriors-basketball-championship',
    excerpt: 'The University of San Carlos Warriors secured their third consecutive championship.',
    image: '/img/cesafi-banner.jpg',
    category: 'Basketball',
    publishedAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'New Athletic Facilities Open at Cebu Sports Complex',
    slug: 'new-athletic-facilities-cebu-sports-complex',
    excerpt: 'State-of-the-art training facilities now available for all member schools.',
    image: '/img/cesafi-banner.jpg',
    category: 'Facilities',
    publishedAt: '2024-01-10'
  },
  {
    id: '4',
    title: 'CESAFI Announces Partnership with Major Sports Brands',
    slug: 'cesafi-sports-brand-partnerships',
    excerpt: 'New partnerships will provide better gear and training resources.',
    image: '/img/cesafi-banner.jpg',
    category: 'Partnerships',
    publishedAt: '2024-01-08'
  }
];

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  // In production, you would fetch the article based on the slug
  const article = mockArticle; // For now, using mock data
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform?: string) => {
    setIsSharing(true);
    const url = window.location.href;
    const title = article.title;

    try {
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share article');
    } finally {
      setIsSharing(false);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/news">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative h-full flex items-end">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <Link href="/news" className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Link>
              
              <div className="mb-4">
                <Badge className="bg-primary text-primary-foreground">
                  {article.category}
                </Badge>
              </div>
              
              <h1 className={`${moderniz.className} text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight`}>
                {article.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="mb-8">
                <CardContent className="p-8">
                  {article.excerpt && (
                    <div className="mb-8">
                      <p className={`${roboto.className} text-lg text-muted-foreground italic leading-relaxed`}>
                        {article.excerpt}
                      </p>
                      <Separator className="mt-6" />
                    </div>
                  )}
                  
                  <div 
                    className={`${roboto.className} prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-li:text-foreground prose-strong:text-foreground`}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <h3 className={`${moderniz.className} text-sm font-semibold text-foreground mb-3`}>Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-1"
            >
              {/* Share Article */}
              <ShareButtons
                title={article.title}
                url={`https://cesafisports.com/news/${article.slug}`}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={`${moderniz.className} text-2xl md:text-3xl font-bold text-foreground mb-8`}>
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle, index) => (
                <motion.div
                  key={relatedArticle.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full overflow-hidden bg-background border-border/30 hover:border-primary/30 transition-all duration-300">
                    <div className="relative h-48">
                      <Image
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="text-xs">
                          {relatedArticle.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className={`${moderniz.className} text-lg font-bold text-foreground mb-2 line-clamp-2`}>
                        {relatedArticle.title}
                      </h3>
                      <p className={`${roboto.className} text-muted-foreground text-sm mb-4 line-clamp-2`}>
                        {relatedArticle.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(relatedArticle.publishedAt).toLocaleDateString()}
                        </span>
                        <Link href={`/news/${relatedArticle.slug}`}>
                          <Button variant="ghost" size="sm">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
