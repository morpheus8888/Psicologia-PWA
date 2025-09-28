module.exports = {
  locales: ['en', 'it'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'locales/{locale}/messages',
      include: ['components', 'pages', 'lib'],
    },
  ],
  format: 'po',
}
