"use client";

import { getPublicPath } from "@/lib/utils";
import { BASE_STYLES } from "@/hooks/useMapstore";
import { useMapStore } from "@/hooks/useMapstore";

/**
 * Thumbnail grid for picking a basemap style.
 * The active style is highlighted and each tile remains perfectly square.
 */
export default function StyleSwitcher() {
  const updateStyle  = useMapStore((s) => s.updateMapStyle);
  const currentStyle = useMapStore((s) => s.currentStyle);

  // Helper: turn camelCase → "Camel Case"
  const prettifyLabel = (s: string) =>
    s
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (m) => m.toUpperCase());

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {Object.keys(BASE_STYLES).map((label) =>
        label !== "Blank" ? (
          <div
            key={label}
            onClick={() => updateStyle(label as keyof typeof BASE_STYLES)}
            className={`
              relative aspect-square w-full overflow-hidden rounded-2xl border-4
              cursor-pointer transition-transform duration-200 ease-in-out
              hover:scale-105
              ${currentStyle === label ? "border-secondary" : "border-primary"}
            `}
          >
            <img
              src={getPublicPath(`/mapStyles/${label}.png`)}
              alt={label}
              className="w-full h-full object-cover"
            />
            <span
              className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs sm:text-sm text-center py-1 capitalize"
            >
              {prettifyLabel(label)}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}
