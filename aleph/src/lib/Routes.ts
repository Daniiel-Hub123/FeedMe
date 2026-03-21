// routes.ts
import { type ComponentType, type LazyExoticComponent } from "react";

export type RouteHandler =
  | LazyExoticComponent<ComponentType<any>>
  | ((...args: any[]) => any);

/** Una ruta protegida concreta */
export interface RouteConfig {
  path: string;
}

export interface ModuleRoute {
  name: string; // "Gestor de Ventas"
  api_path: string; // "/api/ventas"
  routes: Record<string, RouteConfig>;
}

export const APP_MODULES = {
  ASSENT: {
    name: "Emitir",
    api_path: "/api/algo",
    routes: {
      main: {
        path: "/aleph/emitir",
      },
    },
  },
} as const satisfies Record<string, ModuleRoute>;
