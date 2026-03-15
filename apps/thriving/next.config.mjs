/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@upp/ui', '@upp/db', '@upp/utils'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BUILD_SHA: (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || 'dev').slice(0, 7),
  },
};

export default nextConfig;
