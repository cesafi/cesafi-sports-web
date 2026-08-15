import Image from 'next/image';
import { Volleyball, Activity, Dribbble, Goal, Gamepad2, Swords, Waves, Target, Dumbbell, Trophy, Grid3X3 } from 'lucide-react';
import { getSportIcon } from '@/lib/utils/sports';

interface SportIconProps {
  sportName?: string;
  className?: string;
  iconClassName?: string;
}

export function SportIcon({ sportName, className = "h-4 w-4", iconClassName = "text-primary" }: SportIconProps) {
  if (!sportName) return <Trophy className={`${className} ${iconClassName}`} />;
  
  const normalizedName = sportName.toLowerCase().replace(/\s+/g, '_');
  
  const svgMap: Record<string, string> = {
    'athletics': 'athletics.svg',
    'badminton': 'badminton.svg',
    'basketball': 'basketball.svg',
    'beach_volleyball': 'beach_volleyball.svg',
    'chess': 'chess.svg',
    'dancesport': 'dancesport.svg',
    'football': 'football.svg',
    'futsal': 'futsal.svg',
    'karate': 'karatedo.svg',
    'karatedo': 'karatedo.svg',
    'lawn_tennis': 'tennis.svg',
    'swimming': 'swimming.svg',
    'table_tennis': 'table_tennis.svg',
    'taekwondo': 'taekwondo.svg',
    'tennis': 'tennis.svg',
    'volleyball': 'volleyball.svg',
    'weightlifting': 'weightlifting.svg',
  };

  const svgFile = svgMap[normalizedName];
  
  if (svgFile) {
    return (
      <div className={`relative ${className} flex items-center justify-center flex-shrink-0`}>
        <Image 
          src={`/svg/sports/${svgFile}`} 
          alt={sportName}
          fill
          sizes="32px"
          className={`object-contain dark:invert opacity-80`}
        />
      </div>
    );
  }

  const iconName = getSportIcon(sportName);
  const combinedClassName = `${className} ${iconClassName}`;

  switch (iconName) {
    case 'Basketball': return <Dribbble className={combinedClassName} />;
    case 'Volleyball': return <Volleyball className={combinedClassName} />;
    case 'Football': return <Goal className={combinedClassName} />;
    case 'Swimming':
    case 'Waves': return <Waves className={combinedClassName} />;
    case 'Chess': return <Target className={combinedClassName} />;
    case 'Esports':
    case 'Zap': return <Gamepad2 className={combinedClassName} />;
    case 'Combat':
    case 'Sword':
    case 'Swords': return <Swords className={combinedClassName} />;
    case 'Activity': return <Activity className={combinedClassName} />;
    case 'Dumbbell': return <Dumbbell className={combinedClassName} />;
    case 'Grid3X3': return <Grid3X3 className={combinedClassName} />;
    default: return <Trophy className={combinedClassName} />;
  }
}
