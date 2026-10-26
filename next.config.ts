import type { NextConfig } from "next";

// Site entièrement statique : il se déploie sur n'importe quel hébergeur de fichiers
// (GitHub Pages, Vercel, Netlify, Cloudflare Pages). Sur GitHub Pages, le site vit sous
// un sous-chemin (/meridien) : NEXT_PUBLIC_BASE_PATH le fournit au moment du build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
