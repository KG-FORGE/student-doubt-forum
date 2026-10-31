// env.js MUST be the first import so dotenv is loaded before any other module
// reads process.env. Do not reorder these imports.
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀  Server started`);
    console.log(`    URL:         http://localhost:${env.PORT}`);
    console.log(`    Health:      http://localhost:${env.PORT}/api/health`);
    console.log(`    Environment: ${env.NODE_ENV}`);
    console.log(`    Client:      ${env.CLIENT_ORIGIN}\n`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  async function shutdown(signal) {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = await import('./config/db.js');
      await disconnectDB();
      console.log('Server closed\n');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
