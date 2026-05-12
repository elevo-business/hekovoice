import { seedInitialContent } from '../lib/seed-content.js';

const force = process.argv.includes('--force');
const result = seedInitialContent({ force });
console.log(`[seed-content] done: seeded=${result.seeded}, skipped=${result.skippedPages.length}, missing=${result.missingFiles.length}`);
