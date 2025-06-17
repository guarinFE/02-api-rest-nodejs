import { knex } from 'knex'
import path from 'path'
import { env } from 'process'
import dotenv from 'dotenv'
dotenv.config()

if (!env.DATABASE_CLIENT) {
  throw new Error('DATABASE_CLIENT is not set')
}

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const db = knex({
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite3'
      ? {
          filename: env.DATABASE_URL, // agora garantido que é string
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'database', 'migrations'),
    extension: 'ts',
  },
})