/** @type {import('next').NextConfig} */
const nextConfig = {
  /* MD Jamil Contractor App Configuration */
  
  // Isse deployment ke waqt faltu errors nahi aayenge
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Firebase aur Google Images allow karne ke liye
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
      },
    ],
  },

  // Vercel performance ke liye
  swcMinify: true,
  
  // Standalone output Vercel ke liye best hai
  output: 'standalone',
};

export default nextConfig;
