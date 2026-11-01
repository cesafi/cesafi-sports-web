import { Sponsor } from '@/lib/types/sponsors';

interface SponsorLogoListProps {
    sponsors: Sponsor[];
}

export default function SponsorLogoList({ sponsors }: SponsorLogoListProps) {
    return (
        <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {sponsors.map((sponsor) => (
                // White tiles keep every logo legible in both themes, so the light logo is always used
                <li
                    key={sponsor.id}
                    className="border-border/60 flex h-24 w-[calc(50%-0.375rem)] items-center justify-center rounded-xl border bg-white p-4 shadow-sm sm:h-28 sm:w-40 lg:w-36 xl:w-44"
                >
                    <img
                        src={sponsor.logo_url || '/img/cesafi-logo.webp'}
                        alt={sponsor.logo_url ? sponsor.title : `${sponsor.title} - CESAFI Logo`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                    />
                </li>
            ))}
        </ul>
    );
}
