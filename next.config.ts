import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reserve room for Supabase/Resend config in later tasks.
  // Keep this minimal in v1 — strict TS + ESLint do most of the heavy lifting.
  reactStrictMode: true,
};

export default nextConfig;
