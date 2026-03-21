"use client";

import Loading from "@/modules/shared/view/ui/Loading";
import dynamic from "next/dynamic";
import { use } from "react";

type ParamsT = {
  id: string;
  seccion: string;
};

export default function Page({ params }: { params: Promise<ParamsT> }) {
  const { id, seccion } = use(params);
  const Comp =
    (Lazy as Record<string, React.ComponentType<any>>)[seccion] ??
    Lazy.notFound;
  return <Comp id={id} />;
}

const Lazy = {
  notFound: dynamic(() => import("@/modules/shared/view/ui/NotFound"), {
    loading: () => <Loading />,
  }),
} as const;
