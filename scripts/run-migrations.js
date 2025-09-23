#!/usr/bin/env node
const { spawnSync } = require('node:child_process')

if (!process.env.DATABASE_URL) {
  console.log('[migrate] DATABASE_URL missing, skipping prisma migrate deploy')
  process.exit(0)
}

console.log('[migrate] Applying Prisma migrations...')
const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  console.error('[migrate] Prisma migrate deploy failed')
  process.exit(result.status ?? 1)
}

console.log('[migrate] Prisma migrations applied successfully')
