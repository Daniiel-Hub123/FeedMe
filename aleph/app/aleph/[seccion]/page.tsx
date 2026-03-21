"use client"
import { use } from "react";
import dynamic from "next/dynamic";
import Loading from "@/modules/shared/view/ui/Loading";

type ParamsT = { seccion: string };
export default function Page({ params }: { params: Promise<ParamsT> }) {
  const { seccion } = use(params);
  const Comp =
    (Lazy as Record<string, React.ComponentType<any>>)[seccion] ?? Lazy.notFound;
  return <Comp />;
}


//LOADER BAJO DEMANDA
const Lazy = {
  notFound: dynamic(() => import("@/modules/shared/view/ui/NotFound"), {
    loading: () => <Loading />,
  }),
  emitir: dynamic(() => import("@/modules/cert/views/pages/IssuePage"), {
    loading: () => <Loading />,
  }),
  
} as const;
