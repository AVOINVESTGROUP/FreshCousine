import { createServer } from './app.js';
import { seedData } from './bootstrap/seed.js';

const port = Number(process.env.PORT ?? 4000);
const shouldSeed = process.env.SEED_DATA === 'true';

const app = createServer();

async function start() {
  if (shouldSeed) {
    await seedData();
    console.log('[Seed] Demo data has been written to Firestore');
  }

  app.listen(port, () => {
    console.log(`FreshAI backend started on http://localhost:${port}`);
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
