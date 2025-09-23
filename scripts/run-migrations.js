#!/usr/bin/env node
const { spawnSync } = require('node:child_process')

if (!process.env.DATABASE_URL) {
  console.log('[migrate] DATABASE_URL missing, skipping prisma migrate deploy')
  process.exit(0)
}

console.log('[migrate] Applying Prisma migrations...')
const result = spawnSync('npx prisma migrate deploy', {
  encoding: 'utf8',
  shell: true,
})

if (result.stdout) {
  process.stdout.write(result.stdout)
}
if (result.stderr) {
  process.stderr.write(result.stderr)
}

if (result.status !== 0) {
  console.warn('[migrate] Prisma migrate deploy failed, continuing without blocking the build')
  process.exit(0)
}

console.log('[migrate] Prisma migrations applied successfully')
