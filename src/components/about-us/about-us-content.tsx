'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Users, Trophy, Calendar, Target, Award, Heart } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

const stats = [
  { icon: Users, value: '8+', label: 'Member Schools' },
  { icon: Trophy, value: '50+', label: 'Championships' },
  { icon: Calendar, value: '100+', label: 'Annual Events' },
  { icon: Target, value: '5000+', label: 'Student Athletes' },
  { icon: Award, value: '25+', label: 'Years of Excellence' },
  { icon: Heart, value: '100%', label: 'Passion for Sports' }
];

const values = [
  {
    title: 'Excellence',
    description: 'We strive for the highest standards in athletic performance, sportsmanship, and fair play across all competitions.',
    icon: '🏆'
  },
  {
    title: 'Unity',
    description: 'Bringing together diverse educational institutions to create a unified sports community in Cebu.',
    icon: '🤝'
  },
  {
    title: 'Innovation',
    description: 'Embracing new technologies and methodologies to enhance the sports experience for all participants.',
    icon: '💡'
  },
  {
    title: 'Integrity',
    description: 'Maintaining the highest ethical standards in all our competitions and organizational practices.',
    icon: '⚖️'
  }
];

export default function AboutUsContent() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mission Statement */}
        <motion.div
          style={{ y, opacity }}
          className="text-center mb-20"
        >
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-8 leading-tight`}>
            OUR
            <br />
            <span className="text-primary">MISSION</span>
          </h2>
          <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
            To promote and develop athletic excellence among Cebu's educational institutions while fostering unity, sportsmanship, and the holistic development of student-athletes.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className={`${moderniz.className} text-3xl lg:text-4xl font-bold text-foreground mb-2`}>
                    {stat.value}
                  </div>
                  <div className={`${roboto.className} text-sm lg:text-base text-muted-foreground`}>
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <h3 className={`${moderniz.className} text-3xl lg:text-4xl font-bold text-foreground mb-6`}>
              OUR VALUES
            </h3>
            <p className={`${roboto.className} text-lg text-muted-foreground max-w-3xl mx-auto`}>
              The principles that guide everything we do at CESAFI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h4 className={`${moderniz.className} text-xl font-bold text-foreground mb-4`}>
                  {value.title}
                </h4>
                <p className={`${roboto.className} text-muted-foreground leading-relaxed`}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-8 lg:p-12 border border-primary/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className={`${moderniz.className} text-3xl lg:text-4xl font-bold text-foreground mb-6`}>
                OUR STORY
              </h3>
              <p className={`${roboto.className} text-lg text-muted-foreground leading-relaxed mb-6`}>
                Founded with the vision of uniting Cebu's educational institutions through sports, CESAFI has grown from a small group of schools to become the premier athletic foundation in the region.
              </p>
              <p className={`${roboto.className} text-lg text-muted-foreground leading-relaxed`}>
                Over the years, we have witnessed countless moments of triumph, perseverance, and sportsmanship that define the spirit of Cebu sports. Our commitment to excellence and fair play continues to drive us forward.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`${moderniz.className} text-4xl font-bold text-primary mb-2`}>1998</div>
                <div className={`${roboto.className} text-sm text-muted-foreground`}>Founded</div>
              </div>
              <div className="text-center">
                <div className={`${moderniz.className} text-4xl font-bold text-primary mb-2`}>25+</div>
                <div className={`${roboto.className} text-sm text-muted-foreground`}>Years Strong</div>
              </div>
              <div className="text-center">
                <div className={`${moderniz.className} text-4xl font-bold text-primary mb-2`}>8</div>
                <div className={`${roboto.className} text-sm text-muted-foreground`}>Member Schools</div>
              </div>
              <div className="text-center">
                <div className={`${moderniz.className} text-4xl font-bold text-primary mb-2`}>50+</div>
                <div className={`${roboto.className} text-sm text-muted-foreground`}>Championships</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

