import { useLayers } from "@/hooks/useLayers";
import {
  Download,
  Ellipsis,
  Eye,
  EyeClosed,
  Settings,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { LayerSettingsDialog } from "./LayerSettingsDialog";
import { ExportFormat, getPublicPath } from "@/lib/utils";
import SettingsDialog from "../SettingsDialog";
import clsx from "clsx";

// function to determine the icon path based on geometry type
const iconPath = (geom?: string) => {
  if (!geom) return "/icons/polygon.svg"; // fallback
  if (geom.startsWith("Point")) return "/icons/point.svg";
  if (geom.includes("Line")) return "/icons/line.svg";
  return "/icons/polygon.svg";
};

interface LayerItemProps {
  id: string;
  name: string;
  onDelete: () => void;
  onDownload: (format: ExportFormat) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export default function LayerItem({
  id,
  name,
  onDelete,
  onDownload,
  isVisible: propIsVisible,
  onToggleVisibility,
}: LayerItemProps) {
  const { layers, selectedLayerId, setSelectedLayer } = useLayers();
  const layer = layers.find((l) => l.id === id);
  const isBaseLayer = id === "base";
  const isVisible = isBaseLayer ? propIsVisible : layer?.visible ?? true;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isClickable = !isBaseLayer;
  const isSelected = id === selectedLayerId;

  const handleSelect = () => {
    // toggle: click again to un‑select
    if (isBaseLayer) return; // base layer cannot be selected/highlighted
    setSelectedLayer(isSelected ? null : id);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 ${
        isSelected ? "border-2 rounded-lg border-red-500" : ""
      }`}
    >
      <div
        className={clsx(
          "flex items-center gap-4",
          isClickable ? "hover:opacity-80" : "opacity-60 cursor-default"
        )}
        onClick={isClickable ? handleSelect : undefined}
      >
        <span
          className="flex-none h-5 w-5 shrink-0"
          style={{
            backgroundColor: layer?.fillColor, // ← tint
            WebkitMask: `url(${getPublicPath(
              iconPath(layer?.geometryType)
            )}) center / contain no-repeat`,
            mask: `url(${getPublicPath(
              iconPath(layer?.geometryType)
            )}) center / contain no-repeat`,
          }}
        />
        <h3>{name}</h3>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="transition-all duration-900 hover:scale-110"
          >
            <Ellipsis className="h-5 w-5 cursor-pointer hover:shadow-lg text-black hover:bg-black/10 transition-shadow rounded-full p-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-2">
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Layer Settings</span>
            </DropdownMenuItem>
            {!isBaseLayer && (
              <>
                {/* ↓↓↓ NESTED MENU ↓↓↓ */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download as&nbsp;…</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-1">
                    <DropdownMenuItem onClick={() => onDownload("geojson")}>
                      GeoJSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload("gpx")}>
                      GPX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload("png")}>
                      Image&nbsp;(PNG)
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Delete layer</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {!isBaseLayer && (
          <LayerSettingsDialog
            key={layer?.id}
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            layer={layer}
          />
        )}

        {isBaseLayer && (
          <SettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        )}

        {isVisible ? (
          <Eye
            className="h-5 w-5 cursor-pointer hover:shadow-lg text-black hover:bg-black/10 transition-shadow duration-900 rounded-full p-0.5 hover:scale-110"
            onClick={() => {
              onToggleVisibility();
            }}
          />
        ) : (
          <EyeClosed
            className="h-5 w-5 cursor-pointer hover:shadow-lg text-black hover:bg-black/10 transition-shadow duration-900 rounded-full p-0.5 hover:scale-110"
            onClick={() => {
              onToggleVisibility();
            }}
          />
        )}
      </div>
    </div>
  );
}
