"use client";

import {
  SunIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import OptionsSidebar from "./OptionsSidebar";
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { useConfig } from "@/src/hook/useConfig";
import { APP_MODULES } from "@/src/lib/Routes";

type SideBarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function SideBar({ mobile = false, onNavigate }: SideBarProps) {
  const { pinUp } = useConfig();
  const [selected, setSelected] = useState("");

  const expanded = mobile ? true : pinUp;

  return (
    <aside
      className={`
        h-dvh flex flex-col justify-between
        bg-white
        border-r border-gray-200
        shadow-md
        ${expanded ? "w-64" : "w-20"}
        transition-all duration-300
      `}
    >
      {/* LOGO */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
            <Dumbbell size={18} />
          </div>

          {expanded && (
            <h1 className="text-gray-800 font-semibold tracking-wide">
              Olympus
            </h1>
          )}
        </div>

        {mobile && (
          <button onClick={onNavigate} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2 px-3 py-6 overflow-y-auto">
        <OptionsSidebar
          text="Home"
          url="/klan"
          setActive={() => {
            setSelected("HOME");
            onNavigate?.();
          }}
          expanded={expanded}
        />

        {Object.entries(APP_MODULES).map(([code, { name, routes }], i) => {
          return (
            <OptionsSidebar
              key={i}
              text={name}
              url={routes.main.path}
              setActive={() => {
                setSelected(code);
                onNavigate?.();
              }}
              expanded={expanded}
            />
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="flex justify-center gap-4 py-5 border-t border-gray-100">
        {!mobile && <PinSideBard />}
        <LightIndicator expanded={expanded} />
      </div>
    </aside>
  );
}

function LightIndicator({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-gray-500 ${
        !expanded ? "hidden" : ""
      }`}
    >
      <SunIcon className="h-5 w-5" />
      <span className="text-sm">Light mode</span>
    </div>
  );
}

function PinSideBard() {
  const { togglePin, pinUp } = useConfig();

  return (
    <button
      onClick={togglePin}
      className="text-gray-400 hover:text-gray-800 transition"
    >
      {pinUp ? (
        <ArrowsPointingInIcon height={24} width={24} />
      ) : (
        <ArrowsPointingOutIcon height={24} width={24} />
      )}
    </button>
  );
}