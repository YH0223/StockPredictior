import { devIndicatorServerState } from "next/dist/server/dev/dev-indicator-server-state";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 빌드시 ESLint 완전 무시
  },
  typescript: {
    ignoreBuildErrors: true, // 빌드시 타입 에러 무시
  },
};

module.exports = nextConfig; // 무조건 이거 하나만 export!
