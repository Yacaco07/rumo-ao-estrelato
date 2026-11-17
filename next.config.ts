import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  ...(process.env.RAE_PAGES === "1" ? {
    output: "export",
    basePath: "/rumo-ao-estrelato",
    trailingSlash: true,
  } : {}),
};

export default nextConfig;
