import { seedInitialUser } from '../lib/seed-user.js';

const result = await seedInitialUser();
if (result.status === 'no_email' || result.status === 'no_password') {
  console.error('[seed] missing env. Set ADMIN_EMAIL and ADMIN_PASSWORD.');
  process.exit(1);
}
