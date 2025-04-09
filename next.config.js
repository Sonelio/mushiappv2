/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['layjxnjmjovmelxmgcds.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig 