/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🛠️ SMART FIX: 
  // Agar Vercel par build ho raha hai toh 'export' nahi karega, 
  // lekin jab aap local APK banayengi tab 'export' kaam karega.
  output: process.env.VERCEL ? undefined : 'export', 

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
};

export default nextConfig;
