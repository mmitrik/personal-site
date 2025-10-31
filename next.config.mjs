/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  // output: 'export',
  
  // Configure environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Optimize for production
  poweredByHeader: false,
  
  // Configure redirects if needed
  async redirects() {
    return []
  },
}

export default nextConfig;
