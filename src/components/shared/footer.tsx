import Link from 'next/link';
import Image from 'next/image';
import { mangoGrotesque, roboto } from '@/lib/fonts';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/img/cesafi-logo.webp"
                alt="CESAFI Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
                          <span className={`${mangoGrotesque.className} text-lg font-bold`}>
              CESAFI
            </span>
          </div>
          <p className={`${roboto.className} text-muted-foreground text-sm leading-relaxed`}>
            Cebu Schools Athletic Foundation is the central hub for showcasing athletic excellence, 
            academic-driven sports, and esports-inspired energy within Cebu's schools.
          </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className={`${mangoGrotesque.className} text-lg font-semibold`}>
              Quick Links
            </h3>
            <ul className={`${roboto.className} space-y-2 text-sm`}>
              <li>
                <Link href="/sports" className="text-muted-foreground hover:text-primary transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/schools" className="text-muted-foreground hover:text-primary transition-colors">
                  Schools
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground hover:text-primary transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className={`${mangoGrotesque.className} text-lg font-semibold`}>
              Contact
            </h3>
            <div className={`${roboto.className} space-y-2 text-sm text-muted-foreground`}>
              <p>Email: info@cesafi.org</p>
              <p>Phone: +63 32 123 4567</p>
              <p>Address: Cebu City, Philippines</p>
            </div>
          </div>

          {/* Partners Column */}
          <div className="space-y-4">
            <h3 className={`${mangoGrotesque.className} text-lg font-semibold`}>
              Partners
            </h3>
            <div className={`${roboto.className} text-sm text-muted-foreground`}>
              <p>Interested in partnering with CESAFI?</p>
              <Link 
                href="/contact" 
                className="inline-block mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className={`${roboto.className} text-sm text-muted-foreground`}>
              © {currentYear} Cebu Schools Athletic Foundation. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className={`${roboto.className} text-sm text-muted-foreground hover:text-foreground transition-colors`}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={`${roboto.className} text-sm text-muted-foreground hover:text-foreground transition-colors`}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
