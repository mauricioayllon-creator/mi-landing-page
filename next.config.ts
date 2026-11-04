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
      // Calculadora de Oferta (herramientas/calculadora-oferta → public/calculadora)
      { source: "/calculadora", destination: "/calculadora/index.html" },
      { source: "/calculadora/", destination: "/calculadora/index.html" },
      // Paneles por cliente (public/clientes/<cliente>/index.html), p. ej. /clientes/domix
      { source: "/clientes/:cliente", destination: "/clientes/:cliente/index.html" },
      { source: "/clientes/:cliente/", destination: "/clientes/:cliente/index.html" },
    ];
  },
};

export default nextConfig;
