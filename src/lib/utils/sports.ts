/**
 * Formats a sport category division and level into a human-readable string
 * @param division - The division (men, women, mixed)
 * @param levels - The level (elementary, high_school, college)
 * @returns Formatted string like "Men's Elementary" or "Mixed College"
 */
export const formatCategoryName = (division: string, levels: string): string => {
  const divisionMap: Record<string, string> = {
    'men': "Men's",
    'women': "Women's", 
    'mixed': 'Mixed'
  };
  
  const levelMap: Record<string, string> = {
    'elementary': 'Elementary',
    'high_school': 'High School',
    'college': 'College'
  };
  
  const formattedDivision = divisionMap[division] || division;
  const formattedLevel = levelMap[levels] || levels;
  
  return `${formattedDivision} ${formattedLevel}`;
};

/**
 * Formats a sport division into a human-readable string
 * @param division - The division (men, women, mixed)
 * @returns Formatted string like "Men's" or "Mixed"
 */
export const formatDivision = (division: string): string => {
  const divisionMap: Record<string, string> = {
    'men': "Men's",
    'women': "Women's", 
    'mixed': 'Mixed'
  };
  
  return divisionMap[division] || division;
};

/**
 * Formats a sport level into a human-readable string
 * @param level - The level (elementary, high_school, college)
 * @returns Formatted string like "Elementary" or "High School"
 */
export const formatLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    'elementary': 'Elementary',
    'high_school': 'High School',
    'college': 'College'
  };
  
  return levelMap[level] || level;
};

/**
 * Sport icons mapping for different sports
 * Maps sport names to their corresponding icon names from Lucide React
 */
export const getSportIcon = (sportName: string): string => {
  const sportIconMap: Record<string, string> = {
    // Ball Sports
    'Basketball': 'Basketball',
    'Volleyball': 'Volleyball',
    'Football': 'Football',
    'Soccer': 'Soccer',
    'Tennis': 'Tennis',
    'Badminton': 'Badminton',
    'Table Tennis': 'TableTennis',
    'Baseball': 'Baseball',
    'Softball': 'Softball',
    
    // Track & Field
    'Track and Field': 'Activity',
    'Running': 'Zap',
    'Sprinting': 'Zap',
    'Marathon': 'MapPin',
    'Relay': 'Users',
    
    // Swimming
    'Swimming': 'Waves',
    'Diving': 'Waves',
    
    // Combat Sports
    'Boxing': 'Fist',
    'Taekwondo': 'Fist',
    'Karate': 'Fist',
    'Judo': 'Fist',
    'Arnis': 'Sword',
    
    // Other Sports
    'Chess': 'Chess',
    'Cheerdance': 'Sparkles',
    'Dance Sport': 'Music',
    'Sepak Takraw': 'Circle',
    'Archery': 'Target',
    'Weightlifting': 'Dumbbell',
    'Gymnastics': 'Activity',
    
    // Default fallback
    'default': 'Trophy'
  };
  
  // Normalize sport name for matching
  const normalizedSportName = sportName.toLowerCase().trim();
  
  // Try exact match first
  for (const [key, icon] of Object.entries(sportIconMap)) {
    if (key.toLowerCase() === normalizedSportName) {
      return icon;
    }
  }
  
  // Try partial matches for variations
  if (normalizedSportName.includes('basketball')) return 'Basketball';
  if (normalizedSportName.includes('volleyball')) return 'Volleyball';
  if (normalizedSportName.includes('football') || normalizedSportName.includes('soccer')) return 'Football';
  if (normalizedSportName.includes('tennis')) return 'Tennis';
  if (normalizedSportName.includes('badminton')) return 'Badminton';
  if (normalizedSportName.includes('table tennis') || normalizedSportName.includes('ping pong')) return 'TableTennis';
  if (normalizedSportName.includes('baseball')) return 'Baseball';
  if (normalizedSportName.includes('softball')) return 'Softball';
  if (normalizedSportName.includes('track') || normalizedSportName.includes('field')) return 'Activity';
  if (normalizedSportName.includes('running') || normalizedSportName.includes('sprint')) return 'Zap';
  if (normalizedSportName.includes('marathon')) return 'MapPin';
  if (normalizedSportName.includes('relay')) return 'Users';
  if (normalizedSportName.includes('swimming') || normalizedSportName.includes('diving')) return 'Waves';
  if (normalizedSportName.includes('boxing') || normalizedSportName.includes('taekwondo') || 
      normalizedSportName.includes('karate') || normalizedSportName.includes('judo')) return 'Fist';
  if (normalizedSportName.includes('arnis') || normalizedSportName.includes('kali')) return 'Sword';
  if (normalizedSportName.includes('chess')) return 'Chess';
  if (normalizedSportName.includes('cheer') || normalizedSportName.includes('dance')) return 'Sparkles';
  if (normalizedSportName.includes('sepak takraw')) return 'Circle';
  if (normalizedSportName.includes('archery')) return 'Target';
  if (normalizedSportName.includes('weight') || normalizedSportName.includes('lifting')) return 'Dumbbell';
  if (normalizedSportName.includes('gymnastics')) return 'Activity';
  
  // Return default icon if no match found
  return sportIconMap.default;
};
