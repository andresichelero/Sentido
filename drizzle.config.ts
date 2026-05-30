import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/services/database/schema.ts',
  out: './src/services/database/migrations',
  dialect: 'sqlite',
  driver: 'expo',
});
