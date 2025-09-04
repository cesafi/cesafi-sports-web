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
