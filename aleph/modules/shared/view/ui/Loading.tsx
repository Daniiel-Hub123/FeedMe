import { motion } from "framer-motion";

export const TableLoader = () => {
  return (
    <div className="flex items-center justify-center ">
      <motion.div
        className="w-1 h-1 bg-black rounded-full mx-1"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-1 h-1 bg-black rounded-full mx-1"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-1 h-1 bg-black rounded-full mx-1"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
    </div>
  );
};

export default function Loading({ hdvh }: { hdvh?: boolean }) {
  return (
    <div
      className={`flex ${hdvh && "min-h-screen"} items-center justify-center col-span-full`}
    >
      <div className="flex flex-col items-center text-neutral-500">
        {/* Spinner minimal */}
        <svg
          className="h-12 w-12 animate-spin stroke-current opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 2a10 10 0 1 1-7.07 2.93" />
        </svg>

        {/* Etiqueta */}
        {/* <span className="mt-3 text-sm font-medium tracking-wide">
          Cargando…
        </span> */}
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center text-neutral-500">
        {/* Caja vacía */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-14 w-14 stroke-current opacity-40"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M3 9h18M9 21V9" />
        </svg>

        {/* Mensaje */}
        <span className="mt-4 text-sm font-medium tracking-wide">
          Comienza a crear tus registros.
        </span>
      </div>
    </div>
  );
}
