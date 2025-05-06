import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    remotePatterns: [
      new URL(
        "https://udfsnhbwsvbwpbzwiohn.supabase.co/storage/v1/object/public/gum-health-images/**"
      ),
    ],
  },
};

export default nextConfig;
