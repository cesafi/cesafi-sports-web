'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { moderniz, roboto } from '@/lib/fonts';

export default function AboutCesafi() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3], [100, 0]);

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Logo and Big Text Section */}
        <motion.div
          style={{ opacity, y }}
          className="text-center mb-20"
        >
          {/* CESAFI Logo */}
          <div className="flex justify-center mb-12">
            <Image
              src="/img/cesafi-logo.webp"
              alt="CESAFI Logo"
              width={200}
              height={200}
              className="w-32 h-32 sm:w-40 sm:h-40"
            />
          </div>
          
          {/* Big Text */}
          <h2 className={`${moderniz.className} text-5xl lg:text-6xl xl:text-7xl font-black text-foreground mb-8 leading-tight`}>
            ABOUT
            <br />
            <span className="text-primary">CESAFI</span>
          </h2>
          
          <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
            Discover the story behind the Cebu Schools Athletic Foundation and our mission to unite excellence in sports and education.
          </p>
        </motion.div>

        {/* Mission and Vision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className={`${moderniz.className} text-3xl lg:text-4xl font-bold text-foreground`}>
              Our Mission
            </h3>
            <p className={`${roboto.className} text-lg lg:text-xl text-muted-foreground leading-relaxed`}>
              To promote and develop athletic excellence among Cebu's educational institutions while fostering 
              academic achievement, sportsmanship, and community spirit. We believe that sports and education 
              go hand in hand in building well-rounded individuals.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className={`${moderniz.className} text-3xl lg:text-4xl font-bold text-foreground`}>
              Our Vision
            </h3>
            <p className={`${roboto.className} text-lg lg:text-xl text-muted-foreground leading-relaxed`}>
              To be the leading athletic foundation in the Philippines, recognized for our commitment to 
              excellence, innovation in sports development, and our role in strengthening the bond between 
              schools and communities through athletic competition.
            </p>
          </motion.div>
        </div>

        {/* What We Do Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className={`${moderniz.className} text-3xl lg:text-4xl font-bold text-foreground mb-8`}>
            What We Do
          </h3>
          <p className={`${roboto.className} text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed`}>
            We organize and coordinate inter-school athletic competitions, provide training and development 
            programs, and create opportunities for student-athletes to showcase their talents while building 
            lasting friendships and rivalries that enrich the educational experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}