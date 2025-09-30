import type { NextConfig } from "next";

const computeBasePath = (): string => {
  const explicit = process.env.NEXT_BASE_PATH;
  if (typeof explicit === "string") {
    return explicit;
  }
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return "";
  const [owner, name] = repo.split("/");
  if (!owner || !name) return "";
  const isUserSite = name.toLowerCase() === `${owner.toLowerCase()}.github.io`;
  return isUserSite ? "" : `/${name}`;
};

const basePath = computeBasePath();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 15+: typedRoutes moved out of experimental
  typedRoutes: true,
  // Enable static export for GitHub Pages
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;

