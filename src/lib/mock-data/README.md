# Mock Data for CESAFI Standings Development

This directory contains mock data for developing and testing the standings page without needing real Supabase data.

## How It Works

- **Automatic**: Mock data is automatically used when `NODE_ENV=development`
- **No Database**: No real database queries are made in development mode
- **Realistic Data**: Contains authentic CESAFI school names, realistic scores, and proper tournament structure

## Mock Data Included

### 🏫 Schools (8 CESAFI institutions)

- University of Cebu (UC)
- University of San Carlos (USC)
- Southwestern University PHINMA (SWU-PHINMA)
- Cebu Institute of Technology - University (CIT-U)
- University of San Jose - Recoletos (USJ-R)
- University of the Visayas (UV)
- Cebu Eastern College (CEC)
- Don Bosco Technology Center (DBTC)

### 🏀 Competition Structure

- **Season**: 2024-2025
- **Sport**: Basketball (Men's College)
- **Stages**: Group Stage → Playoffs → Finals

### 📊 Data Points

- **28 Group Stage matches** (round-robin format)
- **Complete standings table** with wins/losses/points
- **Playoff bracket** with semifinals
- **Championship final** with realistic scores

## Testing the Standings Page

1. Visit `/standings` in development
2. Use these filters:
   - **Season**: 2024-2025
   - **Sport**: Basketball
   - **Category**: Men's College
   - **Stages**: Group Stage, Playoffs, Finals

## Mock vs Real Data

```typescript
// Development (uses mock data)
NODE_ENV=development → Mock data automatically used

// Production (uses real Supabase data)
NODE_ENV=production → Real database queries
```

## Modifying Mock Data

Edit `src/lib/mock-data/index.ts` to:

- Add more sports/categories
- Change scores and standings
- Add more schools or teams
- Create different tournament structures

## Adding New Mock Scenarios

```typescript
// Add new categories
export const mockCategories = [
  // ... existing categories
  {
    id: 5,
    division: 'women' as const,
    levels: 'college' as const,
    display_name: "Women's College Volleyball"
  }
];

// Add different sport standings
export function getMockStandings(sport: string, stage_id?: number) {
  if (sport === 'volleyball') {
    return getVolleyballMockData(stage_id);
  }
  return getBasketballMockData(stage_id);
}
```

This approach allows for comprehensive testing without touching the production database!
