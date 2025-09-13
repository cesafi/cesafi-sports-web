'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { moderniz, roboto } from '@/lib/fonts';

// Mock gallery data - in production this would come from your media database
const galleryImages = [
  {
    id: 1,
    src: '/img/cesafi-banner.jpg',
    alt: 'CESAFI Opening Ceremony 2024',
    category: 'Events',
    caption: 'The spectacular opening ceremony featuring all member schools'
  },
  {
    id: 2,
    src: '/img/cesafi-banner.jpg',
    alt: 'Basketball Championship Finals',
    category: 'Basketball',
    caption: 'Intense moments from the championship finals'
  },
  {
    id: 3,
    src: '/img/cesafi-banner.jpg',
    alt: 'Football Tournament',
    category: 'Football',
    caption: 'Action-packed football matches at Cebu Sports Complex'
  },
  {
    id: 4,
    src: '/img/cesafi-banner.jpg',
    alt: 'Volleyball Championship',
    category: 'Volleyball',
    caption: 'Women\'s volleyball championship highlights'
  },
  {
    id: 5,
    src: '/img/cesafi-banner.jpg',
    alt: 'Athletics Competition',
    category: 'Athletics',
    caption: 'Track and field events showcasing speed and endurance'
  },
  {
    id: 6,
    src: '/img/cesafi-banner.jpg',
    alt: 'Awarding Ceremony',
    category: 'Awards',
    caption: 'Celebrating excellence in sports and academics'
  }
];

export default function PhotoGallery() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  // Auto-play functionality
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-advance slides when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const openLightbox = (image: typeof galleryImages[0]) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <section ref={ref} className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 left-0 right-0 z-20 pt-20 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`${moderniz.className} text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl`}>
            PHOTO
            <br />
            <span className="text-primary">GALLERY</span>
          </h2>
          <p className={`${roboto.className} text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-lg`}>
            Capturing the spirit, passion, and excellence of CESAFI.
          </p>
        </div>
      </motion.div>

      {/* Full-Screen Carousel */}
      <div className="relative w-full h-screen">
        {/* Main Image Display */}
        <div className="relative w-full h-full">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentIndex ? 1 : 0,
                scale: index === currentIndex ? 1 : 1.1
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === currentIndex}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4">
                    <span className={`${roboto.className} bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide`}>
                      {image.category}
                    </span>
                  </div>
                  <h3 className={`${roboto.className} text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight`}>
                    {image.alt}
                  </h3>
                  <p className={`${roboto.className} text-lg lg:text-xl text-white/90 leading-relaxed`}>
                    {image.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-8 lg:p-12">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="bg-black/30 hover:bg-black/50 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="bg-black/30 hover:bg-black/50 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Play/Pause Button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={togglePlay}
            className="bg-black/30 hover:bg-black/50 text-white p-6 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-4">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex 
                    ? 'ring-4 ring-primary scale-110' 
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Slide Counter */}
        <div className="absolute top-8 right-8">
          <div className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <span className={`${roboto.className} text-sm font-medium`}>
              {currentIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </div>

        {/* Click to View Full Size */}
        <div className="absolute bottom-8 right-8">
          <button
            onClick={() => openLightbox(galleryImages[currentIndex])}
            className="bg-black/30 hover:bg-black/50 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className={`${roboto.className} text-sm font-medium`}>
              View Full Size
            </span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className={`${roboto.className} text-white text-2xl font-bold mb-2`}>
                  {selectedImage.alt}
                </h3>
                <p className={`${roboto.className} text-white/80 text-lg`}>
                  {selectedImage.caption}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}