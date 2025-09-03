'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mangoGrotesque, roboto } from '@/lib/fonts';

// Mock gallery data - in production this would come from your database
const galleryImages = [
  {
    id: 1,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Basketball Championship',
    title: 'Basketball Championship Finals',
    description: 'Intense competition between top schools'
  },
  {
    id: 2,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Football Match',
    title: 'Football Tournament',
    description: 'Exciting matches showcasing young talent'
  },
  {
    id: 3,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Athletics',
    title: 'Track and Field Events',
    description: 'Speed, strength, and determination on display'
  },
  {
    id: 4,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Swimming',
    title: 'Swimming Competition',
    description: 'Grace and power in the water'
  },
  {
    id: 5,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Volleyball',
    title: 'Volleyball Championship',
    description: 'Teamwork and strategy in action'
  },
  {
    id: 6,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Awards',
    title: 'Awards Ceremony',
    description: 'Celebrating excellence and achievement'
  }
];

export default function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="py-24 bg-card">
      <div className="w-full">
        {/* Full Width Carousel */}
        <div className="relative w-full h-[600px] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full h-full cursor-pointer"
            onClick={() => openModal(currentIndex)}
          >
            <Image
              src={galleryImages[currentIndex].src}
              alt={galleryImages[currentIndex].alt}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </motion.div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevImage}
              className="p-3 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors duration-200 backdrop-blur-sm"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-primary' : 'bg-background/60'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextImage}
              className="p-3 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors duration-200 backdrop-blur-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-card/50 text-foreground hover:bg-card/70 transition-colors duration-200"
              >
                <X size={24} />
              </button>

              <div className="relative h-[70vh] rounded-2xl overflow-hidden">
                <Image
                  src={galleryImages[currentIndex].src}
                  alt={galleryImages[currentIndex].alt}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-4 text-center text-foreground">
                <h3 className={`${mangoGrotesque.className} text-2xl font-bold mb-2`}>
                  {galleryImages[currentIndex].title}
                </h3>
                <p className={`${roboto.className} text-lg text-muted-foreground`}>
                  {galleryImages[currentIndex].description}
                </p>
              </div>

              {/* Modal Navigation */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={prevImage}
                  className="p-3 rounded-full bg-card/10 hover:bg-card/20 text-foreground transition-colors duration-200"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className={`${roboto.className} text-foreground`}>
                  {currentIndex + 1} / {galleryImages.length}
                </span>

                <button
                  onClick={nextImage}
                  className="p-3 rounded-full bg-card/10 hover:bg-card/20 text-foreground transition-colors duration-200"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}