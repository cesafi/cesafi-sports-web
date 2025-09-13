'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

const faqItems = [
  {
    id: 1,
    question: "When is the season?",
    answer: "The CESAFI season runs from August to March, with championships and tournaments throughout the academic year.",
    isOpen: false
  },
  {
    id: 2,
    question: "How can I watch?",
    answer: "CESAFI games are broadcast live across all major platforms and social media channels, free to watch for all sports enthusiasts.",
    isOpen: true
  },
  {
    id: 3,
    question: "How can I see previous winners?",
    answer: "Visit our winners archive to see all past champions and tournament results from previous seasons.",
    isOpen: false
  },
  {
    id: 4,
    question: "Can I volunteer for CESAFI?",
    answer: "Yes! We welcome volunteers to help with events, scoring, and various tournament activities. Contact us to get involved.",
    isOpen: false
  }
];

export default function AboutUsFaq() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const [openItems, setOpenItems] = useState<number[]>([2]); // Start with "How can I watch?" open

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section ref={ref} className="py-40 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Column - FAQ */}
          <motion.div
            style={{ y, opacity }}
            className="space-y-6"
          >
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-8 text-left flex items-center justify-between hover:bg-muted/30 transition-all duration-300 group"
                >
                  <span className={`${moderniz.className} text-xl font-semibold text-foreground transition-colors duration-300 ${
                    openItems.includes(item.id) ? 'text-primary' : 'group-hover:text-primary/80'
                  }`}>
                    {item.question}
                  </span>
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openItems.includes(item.id) 
                        ? 'bg-primary text-primary-foreground scale-110' 
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {openItems.includes(item.id) ? (
                        <Minus className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </motion.div>
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openItems.includes(item.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: 1, 
                        height: 'auto',
                        transition: {
                          height: { duration: 0.4, ease: "easeInOut" },
                          opacity: { duration: 0.3, delay: 0.1 }
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        transition: {
                          opacity: { duration: 0.2 },
                          height: { duration: 0.3, delay: 0.1, ease: "easeInOut" }
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8">
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className={`${roboto.className} text-muted-foreground leading-relaxed mb-6 text-lg`}
                        >
                          {item.answer}
                        </motion.p>
                        {item.id === 2 && (
                          <motion.button 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className={`${moderniz.className} bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
                          >
                            WATCH HERE
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative lg:sticky lg:top-32"
          >
            <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-12 border border-border/50 shadow-xl">
              <div className="relative h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="w-40 h-40 bg-primary/20 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg"
                    >
                      <span className="text-7xl">🏆</span>
                    </motion.div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                      className={`${moderniz.className} text-3xl font-bold text-foreground mb-4`}
                    >
                      CESAFI Excellence
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                      className={`${roboto.className} text-muted-foreground text-lg`}
                    >
                      Celebrating athletic achievement
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
