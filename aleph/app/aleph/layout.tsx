"use client";
import SideBar from "@/modules/shared/view/ui/SideBar";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen dark:bg-neutral-900">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block">
        <SideBar />
      </div>

      {/* SIDEBAR MOBILE */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Cerrar menú"
          />

          {/* Drawer */}
          <div className="relative z-10 h-dvh w-72 max-w-[80vw]">
            <SideBar onNavigate={() => setMobileSidebarOpen(false)} mobile />
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER MOBILE */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-300 dark:border-neutral-800">
          <h1 className="font-bold text-lg text_color">Arca</h1>

          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-neutral-700 dark:text-neutral-200"
            aria-label="Abrir menú"
          >
            <p>Abrir</p>
          </button>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}