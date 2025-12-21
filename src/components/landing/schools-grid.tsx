import { getActiveSchools } from '@/actions/schools'
import { School } from '@/lib/types/schools';

export default async function SchoolsGrid() {
  const schoolsResponse = await getActiveSchools();

  if (!schoolsResponse.success || !schoolsResponse.data) {
    return (
      <section className="overflow-hidden">
        <div className="py-8 w-full text-center text-gray-500">
          Unable to load schools
        </div>
      </section>
    );
  }

  const schools = schoolsResponse.data;

  const logos = schools.map((school: School) => ({
    src: school.logo_url || '/img/cesafi-logo.webp',
    alt: school.logo_url ? `${school.name} Logo` : `${school.name} - CESAFI Logo`,
    url: `/schools/${school.abbreviation.toLowerCase()}`
  }));

  return (
    <section className="relative bg-muted/30 pt-16 pb-12 overflow-hidden transition-colors duration-300">
      {/* Wave Separator */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(140%+1.3px)] h-[60px] text-background fill-current transition-colors duration-300">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 font-moderniz uppercase tracking-wider">
          <span className="text-teal">Participating</span> <span className="text-emerald">Schools</span>
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-14">
          {logos.map((school, index) => (
            <div key={`${school.src}-${index}`} className="group relative">
              {school.url ? (
                <a 
                  href={school.url}
                  className="block w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 relative transition-all duration-300 transform hover:scale-110"
                >
                  <img
                    src={school.src}
                    alt={school.alt}
                    className="w-full h-full object-contain"
                  />
                </a>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 relative transition-all duration-300 transform hover:scale-110">
                  <img
                    src={school.src}
                    alt={school.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
