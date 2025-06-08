import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactElement,
} from "react";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
import type { Feature, Polygon, MultiPolygon } from "geojson";

import { useLayers } from "@/hooks/useLayers";
import { ToolDialogShell } from "./ToolDialogShell";
import { LayerSettingsForm } from "../layers/LayerSettingsForm";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, getUniqueColor, getUniqueLayerName } from "@/lib/utils";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { toastMessage } from "../ToastMessage";

export interface IntersectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntersectDialog({
  open,
  onOpenChange,
}: IntersectDialogProps): ReactElement {
  const { layers, addLayer, removeLayer } = useLayers();
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [layerName, setLayerName] = useState<string>("");
  const [fillColor, setFillColor] = useState<string>(getUniqueColor());
  const [fillOpacity, setFillOpacity] = useState<number>(1);
  const [errors, setErrors] = useState<{ layers: boolean }>({ layers: false });
  const [keepInputLayers, setKeepInputLayers] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  // ——— helpers ———
  function bboxesOverlap(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>
  ) {
    const [minXA, minYA, maxXA, maxYA] = turf.bbox(a);
    const [minXB, minYB, maxXB, maxYB] = turf.bbox(b);
    return !(minXA > maxXB || minXB > maxXA || minYA > maxYB || minYB > maxYA);
  }

  function safeIntersect(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> | null {
    try {
      return turf.intersect(a as any, b as any) as Feature<
        Polygon | MultiPolygon
      > | null;
    } catch (err) {
      console.warn("Intersection error, skipping pair:", err);
      return null;
    }
  }

  /** Actually performs the intersection; wrapped in setTimeout so the loader can render first */
  async function handleIntersect(
    layerIds: string[],
    outName: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        try {
          const layerPolys: Feature<Polygon | MultiPolygon>[][] = layerIds.map(
            (id) => {
              const lyr = layers.find((l) => l.id === id);
              if (!lyr) return [];
              return (lyr.data.features || []).filter(
                (f) =>
                  f.geometry.type === "Polygon" ||
                  f.geometry.type === "MultiPolygon"
              ) as Feature<Polygon | MultiPolygon>[];
            }
          );

          if (layerPolys.some((arr) => arr.length === 0)) {
            console.warn(
              "One or more layers have no polygon features to intersect."
            );
          }

          let current: Feature<Polygon | MultiPolygon>[] = layerPolys[0];

          for (let i = 1; i < layerPolys.length && current.length; i++) {
            const nextLayer = layerPolys[i];
            const interim: Feature<Polygon | MultiPolygon>[] = [];
            for (const a of current) {
              for (const b of nextLayer) {
                if (!bboxesOverlap(a, b)) continue;
                const inter = safeIntersect(a, b);
                if (inter) interim.push(inter);
              }
            }
            current = interim;
          }

          if (!current.length) {
            console.warn("No overlapping area found among selected layers.");
            resolve(false);
            return;
          }

          const outFC = turf.featureCollection(current);

          // Add the new intersection layer
          addLayer(
            {
              data: outFC,
              name: outName || getUniqueLayerName("intersect"),
              id: uuidv4(),
              visible: true,
              fillColor,
              fillOpacity,
              geometryType: "Polygon",
            },
            fillColor,
            fillOpacity
          );

          // Remove input layers if user chose not to keep them
          if (!keepInputLayers) {
            layerIds.forEach((id) => removeLayer(id));
          }

          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 0); // ← yield to React
    });
  }

  async function onSave() {
    setIsLoading(true);

    if (selectedLayerIds.length < 2) {
      setErrors({ layers: true });
      setIsLoading(false);
      return;
    }

    try {
      // optional micro-delay so the loader is guaranteed to appear
      await new Promise((r) => setTimeout(r, 0));
      const ok = await handleIntersect(selectedLayerIds, layerName);

      if (!ok) {
        toastMessage({
          title: "Intersection Failed",
          description: "No overlapping area found among selected layers.",
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }

      // success → close & reset
      onOpenChange(false);
      resetForm();

      // Update toast message based on whether input layers were kept or removed
      const action = keepInputLayers
        ? "created"
        : "created and input layers removed";
      toastMessage({
        title: "Intersection Created",
        description: `Intersection layer "${
          layerName || getUniqueLayerName("intersect")
        }" ${action} successfully.`,
        icon: Check,
        duration: 3500,
      });
    } catch (err) {
      console.error("Intersection operation failed:", err);
      toastMessage({
        title: "Intersection Failed",
        description: "An error occurred during the intersection operation.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  /** Reset everything when dialog closes */
  const resetForm = () => {
    setSelectedLayerIds([]);
    setLayerName("");
    setFillColor(getUniqueColor());
    setKeepInputLayers(true);
    setErrors({ layers: false });
  };

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          resetForm();
          setIsLoading(false);
        }
      }}
      title="Intersect"
      description="Creates a new polygon layer from the overlapping area of the selected polygon layers."
      onSave={onSave}
      keepInputLayer={keepInputLayers}
      onKeepInputLayerChange={setKeepInputLayers}
      showKeepInputLayerToggle={true}
    >
      <div className="intersect-tool">
        <IntersectTool
          selectedLayerIds={selectedLayerIds}
          setSelectedLayerIds={setSelectedLayerIds}
          setLayerName={setLayerName}
          errors={errors}
        />
        <div className="intersect-form">
          <LayerSettingsForm
            layerName={layerName}
            onNameChange={setLayerName}
            fillColor={fillColor}
            fillOpacity={fillOpacity}
            onFillColorChange={setFillColor}
            onFillOpacityChange={setFillOpacity}
          />
        </div>
        {/* ——— loader ——— */}
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <Bouncy color="#ff8847" size={60} />
          </div>
        )}
      </div>
    </ToolDialogShell>
  );
}

// ——————————————————————————— UI component ———————————————————————————
interface IntersectToolProps {
  selectedLayerIds: string[];
  setSelectedLayerIds: Dispatch<SetStateAction<string[]>>;
  setLayerName: (name: string) => void;
  errors: { layers: boolean };
}

function IntersectTool({
  selectedLayerIds,
  setSelectedLayerIds,
  setLayerName,
  errors,
}: IntersectToolProps): ReactElement {
  const { layers } = useLayers();
  const [open, setOpen] = useState(false);

  const polyLayers = layers.filter(
    (l) => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon"
  );

  const label = selectedLayerIds.length
    ? `${selectedLayerIds.length} layer${
        selectedLayerIds.length > 1 ? "s" : ""
      } selected`
    : "Choose polygon layers";

  const toggle = (id: string, name: string) => {
    setSelectedLayerIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (next.length && !name.includes("-intersect"))
        setLayerName(getUniqueLayerName(`${name}-intersect`));
      return next;
    });
  };

  return (
    <div className="mt-2 mb-4 ml-1 mr-1 flex flex-row items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            className={cn(
              "w-[230px] justify-between",
              errors.layers && "border-red-500 border-2"
            )}
          >
            {label}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[230px] p-0"
          aria-label="Polygon layer list"
        >
          <Command>
            <CommandInput placeholder="Search layer..." />
            <CommandList>
              <CommandEmpty>No polygon layers found.</CommandEmpty>
              <CommandGroup>
                {polyLayers.map((layer) => {
                  const checked = selectedLayerIds.includes(layer.id);
                  return (
                    <CommandItem
                      key={layer.id}
                      value={layer.name}
                      onSelect={() => toggle(layer.id, layer.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {layer.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errors.layers && (
        <p className="text-sm text-red-500">
          Select at least two polygon layers.
        </p>
      )}
    </div>
  );
}
