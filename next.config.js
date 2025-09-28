/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}
