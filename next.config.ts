import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // El panel de clientes vive en public/panel (lo copia herramientas/panel-clientes/subir.js).
  // Que /panel y /panel/ abran el link del cliente (index.html), con su ?c= y &k=.
  async rewrites() {
    return [
      { source: "/panel", destination: "/panel/index.html" },
      { source: "/panel/", destination: "/panel/index.html" },
    ];
  },
};

export default nextConfig;
