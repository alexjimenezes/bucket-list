import { env, validateEnv } from './config/env';
import { connectDatabase } from './config/database';
import app from './app';

async function main() {
  // Validate environment variables
  validateEnv();

  // Connect to database
  await connectDatabase();

  // Start server
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(`Frontend URL: ${env.frontendUrl}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
