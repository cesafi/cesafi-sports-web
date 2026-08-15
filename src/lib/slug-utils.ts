export function toSlug(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and dashes)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with dashes
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
}

export function fromSlug(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generic interface for items with various name properties
interface NamedItem {
  id: number | string;
  name?: string | null;
  // For stages
  competition_stage?: string; 
  // For categories
  display_name?: string;
  // For sports
  abbreviation?: string | null;
}

export function findItemBySlug<T extends NamedItem>(items: T[], slug: string): T | undefined {
  if (!items || !slug) return undefined;
  
  const targetSlug = slug.toLowerCase();
  
  return items.find(item => {
    // Check name
    if (item.name && toSlug(item.name) === targetSlug) return true;
    
    // Check display_name (categories)
    if (item.display_name && toSlug(item.display_name) === targetSlug) return true;
    
    // Check competition_stage (stages)
    if (item.competition_stage && toSlug(item.competition_stage) === targetSlug) return true;
    
    // Check abbreviation (Sports like BB, VB)
    if (item.abbreviation && toSlug(item.abbreviation) === targetSlug) return true;
    
    return false;
  });
}

export function normalizeStageSlug(stage: string): string {
  if (!stage) return '';
  const slug = stage.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Handle common stage name variations
  if (slug === 'groupstage' || slug === 'group-stage') return 'group-stage';
  if (slug === 'playins' || slug === 'play-ins') return 'play-ins';
  if (slug === 'playoffs') return 'playoffs';
  if (slug === 'finals') return 'finals';
  if (slug === 'semifinals') return 'semifinals';
  if (slug === 'quarterfinals') return 'quarterfinals';
  
  return toSlug(stage);
}
