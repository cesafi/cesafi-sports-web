import { db } from './index';
import { sports, sportsCategories } from './schema';

const CESAFI_SPORTS = [
  { id: 1, name: 'Basketball' },
  { id: 2, name: 'Volleyball' },
  { id: 3, name: 'Football' },
  { id: 4, name: 'Softball' },
  { id: 5, name: 'Athletics' },
  { id: 6, name: 'Swimming' },
  { id: 7, name: 'Badminton' },
  { id: 8, name: 'Table Tennis' },
  { id: 9, name: 'Lawn Tennis' },
  { id: 10, name: 'Chess' },
  { id: 11, name: 'Taekwondo' },
  { id: 12, name: 'Karatedo' },
  { id: 13, name: 'Dancesport' },
  { id: 14, name: 'Scrabble' },
  { id: 15, name: 'Esports' }
];

async function seed() {
  console.log('Seeding CESAFI sports...');

  try {
    // 1. Insert Sports
    for (const sport of CESAFI_SPORTS) {
      await db.insert(sports).values(sport).onConflictDoNothing();
      console.log(`Inserted sport: ${sport.name}`);
    }

    // 2. We could optionally create standard sports categories (divisions/levels) here, 
    // but typically these are added via the admin dashboard as they vary heavily by sport and season.

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding sports:', error);
  } finally {
    process.exit(0);
  }
}

seed();
