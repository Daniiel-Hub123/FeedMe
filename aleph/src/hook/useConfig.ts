"use client";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type Theme = "system" | "light" | "dark";

export type ConfigT = {
  //Tema del sistema
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  //Estado del sidebar
  pinUp: boolean;
  togglePin: () => void;
};

export const useConfig = create<ConfigT>()(
  devtools(
    persist(
      (set, get) => ({
        preferBankId: "",

        theme: "system",
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => {
          const newTheme = get().theme == "dark" ? "light" : "dark";
          set({ theme: newTheme });
          document.documentElement.setAttribute("data-theme", newTheme);
          document.cookie = `theme=${newTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
        },

        pinUp: true,
        togglePin: () =>
          set((state) => ({
            pinUp: !state.pinUp,
          })),

        darkMode: false,
      }),
      {
        name: "arca:prefs",
        storage: createJSONStorage(() => localStorage),
        version: 1,
      },
    ),
  ),
);
