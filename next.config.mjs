/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/index',
          permanent: true,
        },
      ];
    },
    pageExtensions: ['js', 'jsx'],
  };
  
  export default nextConfig;
  