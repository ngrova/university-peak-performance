/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@upp/ui', '@upp/db', '@upp/utils'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
