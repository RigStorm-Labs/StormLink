import { createStore } from './store/index.js';
import { seedStore } from './seed.js';

const store = await createStore();
const seeded = await seedStore(store);
console.log(seeded ? `Seeded ${seeded} records.` : 'Database already contains data — nothing to seed.');
process.exit(0);
