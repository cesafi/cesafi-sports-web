import Link from 'next/link';
import Image from 'next/image';
import { moderniz, roboto } from '@/lib/fonts';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground border-border border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/img/cesafi-logo.webp"
                alt="CESAFI Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className={`${moderniz.className} text-lg font-bold`}>CESAFI</span>
            </div>
            <p className={`${roboto.className} text-muted-foreground text-sm leading-relaxed`}>
              Cebu Schools Athletic Foundation is the central hub for showcasing athletic
              excellence, academic-driven sports, and esports-inspired energy within Cebu&apos;s
              schools.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className={`${moderniz.className} text-lg font-semibold`}>Quick Links</h3>
            <ul className={`${roboto.className} space-y-2 text-sm`}>
              <li>
                <Link
                  href="/sports"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link
                  href="/schools"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Schools
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className={`${moderniz.className} text-lg font-semibold`}>Contact</h3>
            <div className={`${roboto.className} text-muted-foreground space-y-2 text-sm`}>
              <p>Email: info@cesafi.org</p>
              <p>Phone: +63 32 123 4567</p>
              <p>Address: Cebu City, Philippines</p>
            </div>
          </div>

          {/* Partners Column */}
          <div className="space-y-4">
            <h3 className={`${moderniz.className} text-lg font-semibold`}>Partners</h3>
            <div className={`${roboto.className} text-muted-foreground text-sm`}>
              <p>Interested in partnering with CESAFI?</p>
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 inline-block rounded-lg px-4 py-2 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-border mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 text-center md:flex-row md:space-y-0">
            <p className={`${roboto.className} text-muted-foreground text-sm`}>
              © {currentYear} Cebu Schools Athletic Foundation. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy-policy"
                className={`${roboto.className} text-muted-foreground hover:text-foreground text-sm transition-colors`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className={`${roboto.className} text-muted-foreground hover:text-foreground text-sm transition-colors`}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
