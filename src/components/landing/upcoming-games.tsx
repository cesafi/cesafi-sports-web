'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Calendar, MapPin, Users, Trophy, Clock } from 'lucide-react';
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
    venue: 'Cebu City Sports Center',
    status: 'upcoming',
    category: 'Women\'s Division'
  },
  {
    id: 4,
    homeTeam: 'Southwestern University',
    awayTeam: 'University of San Carlos',
    sport: 'Basketball',
    date: '2024-01-28',
    time: '19:00',
    venue: 'Cebu Coliseum',
    status: 'upcoming',
    category: 'Men\'s Division'
  }
];

export default function UpcomingGames() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Parallax */}
        <motion.div
          style={{ y, opacity }}
          className="text-center mb-20"
        >
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-8 leading-tight`}>
            UPCOMING
            <br />
            <span className="text-primary">GAMES</span>
          </h2>
          <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
            Witness the most thrilling athletic competitions in Cebu. 
            Mark your calendars for these epic showdowns.
          </p>
        </motion.div>

        {/* Featured Game - Large Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-8 lg:p-12 border border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              
              {/* Team 1 */}
              <div className="text-center lg:text-right">
                <div className={`${roboto.className} text-2xl lg:text-3xl font-bold text-foreground mb-4`}>
                  {upcomingGames[0].homeTeam}
                </div>
                <div className={`${roboto.className} text-lg text-muted-foreground`}>
                  Home Team
                </div>
              </div>

              {/* VS Section */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <div className={`${roboto.className} text-2xl font-bold text-primary mb-2`}>
                  VS
                </div>
                <div className={`${roboto.className} text-sm text-muted-foreground mb-4`}>
                  {upcomingGames[0].sport} • {upcomingGames[0].category}
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(upcomingGames[0].date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{upcomingGames[0].time}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{upcomingGames[0].venue}</span>
                </div>
              </div>

              {/* Team 2 */}
              <div className="text-center lg:text-left">
                <div className={`${roboto.className} text-2xl lg:text-3xl font-bold text-foreground mb-4`}>
                  {upcomingGames[0].awayTeam}
                </div>
                <div className={`${roboto.className} text-lg text-muted-foreground`}>
                  Away Team
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Games - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingGames.slice(1, 4).map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-muted/30 rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-lg"
            >
              {/* Sport Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className={`${roboto.className} text-sm font-medium text-primary`}>
                    {game.sport}
                  </span>
                </div>
                <span className={`${roboto.className} text-xs px-3 py-1 bg-primary/10 text-primary rounded-full`}>
                  {game.category}
                </span>
              </div>

              {/* Teams */}
              <div className="text-center mb-6">
                <div className={`${roboto.className} text-lg font-bold text-foreground mb-2`}>
                  {game.homeTeam}
                </div>
                <div className={`${roboto.className} text-xl font-bold text-primary mb-2`}>
                  VS
                </div>
                <div className={`${roboto.className} text-lg font-bold text-foreground`}>
                  {game.awayTeam}
                </div>
              </div>

              {/* Game Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className={`${roboto.className} text-sm`}>
                    {new Date(game.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className={`${roboto.className} text-sm`}>
                    {game.time}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className={`${roboto.className} text-sm`}>
                    {game.venue}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button className={`${roboto.className} w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200 hover:scale-105 shadow-lg`}>
                View Details
              </button>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className={`${roboto.className} bg-foreground hover:bg-foreground/90 text-background px-10 py-5 rounded-2xl font-semibold text-xl uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-lg`}>
            View All Games
          </button>
        </motion.div>
      </div>
    </section>
  );
}