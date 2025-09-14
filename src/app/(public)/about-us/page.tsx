import AboutUsFaq from '@/components/about-us/about-us-faq';
import AboutUsNews from '@/components/about-us/about-us-news';
import { moderniz, roboto } from '@/lib/fonts';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-20">
        {/* Background with dynamic light streaks */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-background via-muted/20 to-background" />
          
          {/* Static light streaks */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm opacity-30" />
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent blur-sm opacity-20" />
            <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent blur-sm opacity-40" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Section - Text Content */}
            <div className="space-y-8">
              <div>
                <h1 className={`${moderniz.className} text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight`}>
                  CESAFI
                  <br />
                  <span className="text-primary">SPORTS</span>
                </h1>
              </div>

              <div>
                <p className={`${roboto.className} text-xl lg:text-2xl text-muted-foreground leading-relaxed`}>
                  Honoring the athletes, coaches, and institutions who define the future of competitive sports in Cebu.
                </p>
              </div>

              <div>
                <p className={`${roboto.className} text-lg text-muted-foreground leading-relaxed`}>
                  CESAFI is dedicated to showcasing top-class performance and innovation from the players, teams, schools, events, and personalities within the Cebu sports scene.
                </p>
              </div>
            </div>

            {/* Right Section - Visual Elements */}
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-3xl p-8 border border-primary/20">
                  <div className="relative h-96 bg-muted/30 rounded-2xl overflow-hidden">
                    <Image
                      src="/img/cesafi-banner.jpg"
                      alt="CESAFI Sports Excellence"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Overlay Text */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className={`${moderniz.className} text-2xl font-bold text-white mb-2`}>
                        Athletic Excellence
                      </h3>
                      <p className={`${roboto.className} text-white/90`}>
                        Celebrating the best in Cebu sports
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Award/Trophy Element */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 bg-accent-foreground rounded-full flex items-center justify-center">
                    <span className={`${moderniz.className} text-accent font-bold text-lg`}>🏆</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <AboutUsFaq />

      {/* News Integration */}
      <AboutUsNews />
    </>
  );
}
