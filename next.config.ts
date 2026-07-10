import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  customWorkerDir: "worker"
});

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {}
};

export default withPWA(nextConfig);

