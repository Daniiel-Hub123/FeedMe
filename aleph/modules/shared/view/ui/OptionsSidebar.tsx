"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  text: string;
  url: string;
  setActive?: () => void;
  expanded?: boolean;
};

export default function OptionsSidebar({
  text,
  url,
  setActive,
  expanded = true,
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Link href={url} onClick={setActive} className="block">
      <div
        className={`
          relative flex items-center gap-4 px-4 h-11 rounded-lg
          transition-all duration-200
          ${
            isActive
              ? "bg-gray-100 text-gray-900 font-medium"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }
          ${expanded ? "justify-start" : "justify-center"}
        `}
      >
        {/* ACTIVE BAR */}
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 bg-gray-900 rounded-r-full" />
        )}

        {expanded && (
          <span className="text-sm tracking-wide truncate">{text}</span>
        )}
      </div>
    </Link>
  );
}