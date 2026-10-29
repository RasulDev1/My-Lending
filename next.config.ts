import type { NextConfig } from "next";

// Статическая сборка в папку out/. Для GitHub Pages адрес сайта — /My-Lending,
// поэтому basePath задаётся переменной NEXT_PUBLIC_BASE_PATH в workflow деплоя.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
