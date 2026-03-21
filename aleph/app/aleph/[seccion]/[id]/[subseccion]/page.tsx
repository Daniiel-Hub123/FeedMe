"use client";


import Loading from "@/modules/shared/view/ui/Loading";
import dynamic from "next/dynamic";
import { use } from "react";

type ParamsT = {
  id: string;
  seccion: string;
  subseccion: string;
};

export default function Page({ params }: { params: Promise<ParamsT> }) {
  const { id, seccion, subseccion } = use(params);
  // 2) Resolvemos la sección
  const rawSecc = (Lazy as Record<string, any>)[seccion] ?? Lazy.home;

  const Comp: React.ComponentType<any> =
    typeof rawSecc === "function"
      ? rawSecc
      : rawSecc?.[subseccion as string] ?? Lazy.home;

  // 4) Render con el id (si el comp no lo necesita, lo ignora sin drama)
  return <Comp id={id} />;
}

const Lazy = {
  home: dynamic(() => import("@/modules/shared/view/ui/NotFound"), {
    loading: () => <Loading />,
  })
} as const;
