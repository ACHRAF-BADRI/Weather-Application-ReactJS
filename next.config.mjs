/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // This enables static export
    assetPrefix: process.env.NODE_ENV === 'production' ? '/Weather-Application-ReactJS/' : '',
    basePath: process.env.NODE_ENV === 'production' ? '/Weather-Application-ReactJS' : '',
    images: {
      unoptimized: true, // Disable image optimization for static export
    },
  };
  
  export default nextConfig;
  