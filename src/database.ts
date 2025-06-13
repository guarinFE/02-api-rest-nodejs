import { knex } from 'knex'
import path from 'path'

export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database', 'app.db', ),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'database', 'migrations'),
    extension: 'ts',
  },
})