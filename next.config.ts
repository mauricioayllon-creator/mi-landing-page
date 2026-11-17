import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Atajos que llevan a Tu panel (por si alguien escribe la dirección de memoria).
  async redirects() {
    return [{ source: "/admin", destination: "/panel", permanent: false }];
  },
  // El panel de clientes vive en public/panel (lo copia herramientas/panel-clientes/subir.js).
  // /panel es la puerta de Tu panel (src/app/tu-panel): Mi negocio, Calculadoras, Links y Mapa.
  // Si el link trae ?c= (el link de la campaña de un cliente), abre su página (index.html) como siempre.
  async rewrites() {
    return [
      { source: "/panel", has: [{ type: "query", key: "c" }], destination: "/panel/index.html" },
      { source: "/panel/", has: [{ type: "query", key: "c" }], destination: "/panel/index.html" },
      { source: "/panel", destination: "/tu-panel" },
      { source: "/panel/", destination: "/tu-panel" },
      // Calculadora de Oferta (herramientas/calculadora-oferta → public/calculadora)
      { source: "/calculadora", destination: "/calculadora/index.html" },
      { source: "/calculadora/", destination: "/calculadora/index.html" },
      // Calculadora de Pauta (public/calculadora-pauta): si conviene pautar, cuánto y qué arreglar primero
      { source: "/calculadora-pauta", destination: "/calculadora-pauta/index.html" },
      { source: "/calculadora-pauta/", destination: "/calculadora-pauta/index.html" },
      // Paneles por cliente (public/clientes/<cliente>/index.html), p. ej. /clientes/domix
      { source: "/clientes/:cliente", destination: "/clientes/:cliente/index.html" },
      { source: "/clientes/:cliente/", destination: "/clientes/:cliente/index.html" },
    ];
  },
};

export default nextConfig;
