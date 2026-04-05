/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Leave output as default (Node server / Vercel serverless). Do not enable "Static Export"
  // in the Vercel dashboard for this project — it is incompatible with this App Router setup.
};

export default nextConfig;
