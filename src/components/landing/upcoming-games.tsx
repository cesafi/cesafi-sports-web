'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

// Mock upcoming games data - in production this would come from your matches database
const upcomingGames = [
  {
    id: 1,
    homeTeam: 'University of San Carlos',
    awayTeam: 'University of Cebu',
    sport: 'Basketball',
    date: '2024-01-20',
    time: '18:00',
    venue: 'Cebu Coliseum',
    status: 'upcoming',
    category: 'Men\'s Division'
  },
  {
    id: 2,
    homeTeam: 'Cebu Institute of Technology',
    awayTeam: 'University of San Jose Recoletos',
    sport: 'Football',
    date: '2024-01-22',
    time: '15:30',
    venue: 'Cebu Sports Complex',
    status: 'upcoming',
    category: 'Men\'s Division'
  },
  {
    id: 3,
    homeTeam: 'University of the Philippines Cebu',
    awayTeam: 'Cebu Normal University',
    sport: 'Volleyball',
    date: '2024-01-25',
    time: '16:00',
    venue: 'USC Gymnasium',
    status: 'upcoming',
    category: 'Women\'s Division'
  },
  {
    id: 4,
    homeTeam: 'Southwestern University',
    awayTeam: 'Cebu Technological University',
    sport: 'Swimming',
    date: '2024-01-28',
    time: '09:00',
    venue: 'CESAFI Aquatic Center',
    status: 'upcoming',
    category: 'Mixed Events'
  }
];

const getSportIcon = (sport: string) => {
  switch (sport.toLowerCase()) {
    case 'basketball':
      return Trophy;
    case 'football':
      return Users;
    case 'volleyball':
      return Trophy;
    case 'swimming':
      return Users;
    default:
      return Trophy;
  }
};

const getSportColor = (sport: string) => {
  switch (sport.toLowerCase()) {
    case 'basketball':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'football':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'volleyball':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'swimming':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function UpcomingGames() {
  return (
    <section className="py-24 bg-background">
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
            UPCOMING GAMES
          </h2>
          <p className={`${roboto.className} text-xl text-muted-foreground max-w-3xl mx-auto`}>
            Don't miss the exciting matches and competitions happening across Cebu's premier athletic venues.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {upcomingGames.map((game, index) => {
            const SportIcon = getSportIcon(game.sport);
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                {/* Sport Category */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`${getSportColor(game.sport)} px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2`}>
                    <SportIcon size={16} />
                    {game.sport}
                  </span>
                  <span className={`${roboto.className} text-sm text-muted-foreground`}>
                    {game.category}
                  </span>
                </div>

                {/* Teams */}
                <div className="text-center mb-6">
                  <div className={`${moderniz.className} text-xl font-bold text-foreground mb-2`}>
                    {game.homeTeam}
                  </div>
                  <div className={`${roboto.className} text-2xl font-bold text-primary mb-2`}>
                    VS
                  </div>
                  <div className={`${moderniz.className} text-xl font-bold text-foreground`}>
                    {game.awayTeam}
                  </div>
                </div>

                {/* Game Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar size={18} />
                    <span className={`${roboto.className}`}>
                      {new Date(game.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar size={18} />
                    <span className={`${roboto.className}`}>
                      {game.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin size={18} />
                    <span className={`${roboto.className}`}>
                      {game.venue}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button className={`${moderniz.className} w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold text-lg uppercase tracking-wide transition-all duration-200 hover:scale-105 shadow-lg`}>
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Games Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className={`${moderniz.className} bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg uppercase tracking-wide transition-all duration-200 hover:scale-105`}>
            View All Games
          </button>
        </motion.div>
      </div>
    </section>
  );
}