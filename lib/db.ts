import Database from 'better-sqlite3'
import path from 'path'

// On platforms like Vercel the filesystem is read-only except for `/tmp`.
// Use a temporary location when running in those environments so the database
// can be created at runtime.
const dbFile = process.env.VERCEL
  ? path.join('/tmp', 'data.sqlite')
  : path.join(process.cwd(), 'data.sqlite')
const db = new Database(dbFile)

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT
);
`)

export interface User {
  id: number
  email: string
  password: string
  name?: string
  isAdmin?: boolean
}

export const createUser = (email: string, password: string, name?: string) => {
  const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
  const info = stmt.run(email, password, name)
  return info.lastInsertRowid as number
}

export const getUserByEmail = (email: string): User | undefined => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

export default db
