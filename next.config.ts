import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "./"),
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
  },
};

export default nextConfig;
