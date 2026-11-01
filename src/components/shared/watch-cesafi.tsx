import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Facebook, MapPin, Youtube } from 'lucide-react';
import BasketballIcon from '@/components/shared/basketball-icon';
import { moderniz, roboto } from '@/lib/fonts';

const WATCH_OPTIONS = [
  {
    title: 'Watch live on Facebook',
    detail: 'Game streams on the official CESAFI page',
    href: 'https://www.facebook.com/thecesafi',
    icon: Facebook,
    external: true
  },
  {
    title: 'Watch on YouTube',
    detail: 'Game coverage and highlights',
    href: 'https://www.youtube.com/@CESAFIOfficial',
    icon: Youtube,
    external: true
  },
  {
    title: 'Courtside at Cebu Coliseum',
    detail: 'Check game dates and tip-off times',
    href: '/schedule',
    icon: MapPin,
    external: false
  }
];

const ROW_BASE =
  'group flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:outline-none';

function HalfCourtLines({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 470"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="496" height="466" />
      <rect x="170" y="2" width="160" height="190" />
      <circle cx="250" cy="192" r="60" />
      <path d="M30 2V140A237 237 0 0 0 470 140V2" />
      <circle cx="250" cy="52" r="8" />
      <path d="M220 40H280" />
      <path d="M190 468A60 60 0 0 1 310 468" />
    </svg>
  );
}

export default function WatchCesafi() {
  return (
    <section
      aria-labelledby="watch-cesafi-heading"
      className="bg-primary text-primary-foreground @container relative isolate overflow-hidden rounded-2xl shadow-xl"
    >
      <HalfCourtLines className="pointer-events-none absolute -right-20 -bottom-16 -z-10 w-[120%] max-w-2xl text-white/10" />

      <div className="grid gap-5 p-4 sm:p-6 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] @2xl:items-center @2xl:gap-8 @2xl:p-8">
        <div>
          <p
            className={`${roboto.className} bg-accent text-accent-foreground mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold`}
          >
            <BasketballIcon className="size-4 shrink-0" />
            Basketball season tips off in August
          </p>
          <h3
            id="watch-cesafi-heading"
            className={`${moderniz.className} text-base leading-snug font-bold text-white/85 sm:text-lg`}
          >
            Where to watch{' '}
            <span className="block text-2xl leading-tight text-white sm:text-3xl @2xl:text-2xl">
              CESAFI Basketball
            </span>
          </h3>
          <p className={`${roboto.className} mt-3 text-sm leading-relaxed text-white/90 sm:text-base`}>
            Catch the action courtside or follow the games online.
          </p>
        </div>

        <ul className="space-y-2">
          {WATCH_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const Arrow = option.external ? ArrowUpRight : ArrowRight;
            const isFeatured = index === 0;

            return (
              <li key={option.title}>
                <Link
                  href={option.href}
                  {...(option.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`${ROW_BASE} ${
                    isFeatured
                      ? 'text-primary border-white bg-white hover:bg-white/90'
                      : 'border-white/20 bg-black/15 text-white hover:bg-black/25'
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      isFeatured ? 'bg-primary text-white' : 'bg-white/15 text-white'
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className={`${roboto.className} min-w-0 flex-1`}>
                    <span className="block text-sm leading-snug font-semibold sm:text-base">
                      {option.title}
                      {option.external && <span className="sr-only"> (opens in a new tab)</span>}
                    </span>
                    <span
                      className={`block text-xs leading-snug sm:text-sm ${
                        isFeatured ? 'text-primary/90' : 'text-white/85'
                      }`}
                    >
                      {option.detail}
                    </span>
                  </span>
                  <Arrow
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
