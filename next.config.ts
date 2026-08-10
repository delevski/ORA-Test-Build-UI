import type { NextConfig } from "next";

// GITHUB_PAGES=true (set by the deploy workflow) builds a fully static
// export served from https://<user>.github.io/ORA-Test-Build-UI/
const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // raw <video>/<a> tags don't get basePath automatically — expose it
  env: { NEXT_PUBLIC_BASE_PATH: isPages ? "/ORA-Test-Build-UI" : "" },
  ...(isPages && {
    output: "export" as const,
    basePath: "/ORA-Test-Build-UI",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
