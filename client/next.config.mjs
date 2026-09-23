/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` writes a plain HTML/JS site to out/, hosted on Netlify.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
