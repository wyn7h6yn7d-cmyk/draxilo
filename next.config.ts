import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Next.js was inferring the wrong root due to lockfiles outside this app.
    // This keeps dev/build resolution scoped to /leadforge.
    root: projectRoot,
  },
};

export default nextConfig;
