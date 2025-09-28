import { defineConfig } from '@lingui/cli'

export default defineConfig({
  locales: ['en', 'it'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'locales/{locale}/messages',
      include: ['components', 'pages', 'lib'],
    },
  ],
  format: 'po',
})
