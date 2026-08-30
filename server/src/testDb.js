import { prisma } from './lib/prisma.js';

async function test() {
  try {
    console.log('[TEST] Attempting to count users...');
    const count = await prisma.user.count();
    console.log('[TEST] User count:', count);
  } catch (err) {
    console.error('[TEST] ERROR:', err.message);
    if (err.code) console.error('[TEST] Code:', err.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();
