import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";

// 👉 Type‑only imports (fixes TS error: "no exported member Feature")
import type { Feature, Polygon, MultiPolygon, Position } from "geojson";
import type { AllGeoJSON } from "@turf/helpers";

import { useLayers } from "@/hooks/useLayers";
import { ToolDialogShell } from "./ToolDialogShell";
import { LayerSettingsForm } from "../layers/LayerSettingsForm";
import { cn, getUniqueColor, getUniqueLayerName } from "@/lib/utils";

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
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { toastMessage } from "../ToastMessage";

/**
 * UnionDialog — create a new polygon layer consisting of the geometric
 * union of two or more *polygon* input layers.
 *
 * Enhanced with toast notifications, loading animation, and input layer management.
 */
export interface UnionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnionDialog({ open, onOpenChange }: UnionDialogProps) {
  const { layers, addLayer, removeLayer } = useLayers();

  // —— form state ——
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [layerName, setLayerName] = useState<string>("");
  const [fillColor, setFillColor] = useState<string>(getUniqueColor());
  const [fillOpacity, setFillOpacity] = useState<number>(1);
  const [errors, setErrors] = useState<{ layers: boolean }>({ layers: false });
  const [keepInputLayers, setKeepInputLayers] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

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
      const success = await handleUnion(selectedLayerIds, layerName);

      if (!success) {
        toastMessage({
          title: "Union Failed",
          description:
            "Need at least two valid polygon features to create union.",
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
        title: "Union Created",
        description: `Union layer "${
          layerName || getUniqueLayerName("union")
        }" ${action} successfully.`,
        icon: Check,
        duration: 3500,
      });
    } catch (err) {
      console.error("Union operation failed:", err);
      toastMessage({
        title: "Union Failed",
        description: "An error occurred during the union operation.",
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

  /** Resilient union that always returns a Polygon/MultiPolygon feature */
  function safeUnion(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {
    try {
      const res = turf.union(a as any, b as any);
      if (res) return res as Feature<Polygon | MultiPolygon>;
    } catch (err: any) {
      if (
        !(
          typeof err?.message === "string" &&
          err.message.includes("Must have at least 2 geometries")
        )
      ) {
        console.warn("Union failed, falling back to MultiPolygon merge:", err);
      }
    }

    // —— manual MultiPolygon concatenation ——
    const coords: Position[][][] = [];
    const pushCoords = (feat: Feature<Polygon | MultiPolygon>) => {
      if (feat.geometry.type === "Polygon")
        coords.push(feat.geometry.coordinates);
      else coords.push(...feat.geometry.coordinates);
    };
    pushCoords(a);
    pushCoords(b);
    return turf.multiPolygon(coords) as Feature<Polygon | MultiPolygon>;
  }

  /** Actually performs the union; wrapped in setTimeout so the loader can render first */
  async function handleUnion(
    layerIds: string[],
    outName: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        try {
          const polyLayers = layers.filter((l) => layerIds.includes(l.id));

          let unionGeom: Feature<Polygon | MultiPolygon> | null = null;
          let featureCount = 0;

          for (const lyr of polyLayers) {
            const fc = lyr.data as AllGeoJSON;
            turf.flattenEach(
              fc,
              (currentFeature: Feature<Polygon | MultiPolygon>) => {
                featureCount += 1;
                unionGeom = unionGeom
                  ? safeUnion(unionGeom, currentFeature)
                  : currentFeature;
              }
            );
          }

          if (!unionGeom || featureCount < 2) {
            console.error(
              "Union failed — need at least two valid polygon features."
            );
            resolve(false);
            return;
          }

          // TypeScript: unionGeom is guaranteed to be defined here
          const outFeature = turf.feature(
            (unionGeom as Feature<Polygon | MultiPolygon>).geometry
          );
          const outFC = turf.featureCollection([outFeature]);
          const geometryType = outFeature.geometry.type as
            | "Polygon"
            | "MultiPolygon";

          // Add the new union layer
          addLayer(
            {
              data: outFC,
              name: outName || getUniqueLayerName("union"),
              id: uuidv4(),
              visible: true,
              fillColor,
              fillOpacity,
              geometryType,
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

  // ─── UI ────────────────────────────────────────────────────────────────
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
      title="Union"
      description="Creates a new polygon layer that is the geometric union of two or more input polygon layers."
      onSave={onSave}
      keepInputLayer={keepInputLayers}
      onKeepInputLayerChange={setKeepInputLayers}
      showKeepInputLayerToggle={true}
    >
      <div className="union-tool">
        <UnionTool
          selectedLayerIds={selectedLayerIds}
          setSelectedLayerIds={setSelectedLayerIds}
          setLayerName={setLayerName}
          errors={errors}
        />
        <div className="union-form">
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

// ==========================================================================
interface UnionToolProps {
  selectedLayerIds: string[];
  setSelectedLayerIds: Dispatch<SetStateAction<string[]>>;
  setLayerName: (name: string) => void;
  errors: { layers: boolean };
}

function UnionTool({
  selectedLayerIds,
  setSelectedLayerIds,
  setLayerName,
  errors,
}: UnionToolProps) {
  const { layers } = useLayers();
  const [open, setOpen] = useState(false);

  const polygonLayers = layers.filter(
    (l) => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon"
  );
  const buttonLabel =
    selectedLayerIds.length === 0
      ? "Choose polygon layers"
      : `${selectedLayerIds.length} layer${
          selectedLayerIds.length > 1 ? "s" : ""
        } selected`;

  const toggleLayer = (id: string, name: string) => {
    setSelectedLayerIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (next.length && !name.includes("-union"))
        setLayerName(getUniqueLayerName(`${name}-union`));
      return next;
    });
  };

  return (
    <div className="mt-2 mb-4 ml-1 mr-1 flex flex-row justify-between items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-[230px] justify-between",
              errors.layers && "border-red-500 border-2"
            )}
          >
            {buttonLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[230px] p-0">
          <Command>
            <CommandInput placeholder="Search layer..." />
            <CommandList>
              <CommandEmpty>No polygon layers found.</CommandEmpty>
              <CommandGroup>
                {polygonLayers.map((layer) => {
                  const isChecked = selectedLayerIds.includes(layer.id);
                  return (
                    <CommandItem
                      key={layer.id}
                      value={layer.name}
                      onSelect={() => toggleLayer(layer.id, layer.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isChecked ? "opacity-100" : "opacity-0"
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
      <div className="text-red-500 text-sm m-auto text-center">
        {errors.layers && (
          <p className="text-sm text-red-500">
            Select at least two polygon layers.
          </p>
        )}
      </div>
    </div>
  );
}
