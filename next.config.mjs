/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. APK banane ke liye static export zaroori hai
  output: 'export', 

  // 2. Images ko optimize hone se rokta hai (Capacitor/APK mein optimization kaam nahi karta)
  images: {
    unoptimized: true,
  },

  // 3. Agar aap trailing slashes chahte hain toh ise true rakhein (Optional)
  trailingSlash: true,
};

export default nextConfig;
