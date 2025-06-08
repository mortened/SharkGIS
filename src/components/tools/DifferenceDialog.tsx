import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction, ReactElement } from "react";
import * as turf from "@turf/turf";
import type { AllGeoJSON } from "@turf/helpers";
import { v4 as uuidv4 } from "uuid";

// 👉 Type‑only imports (works with geojson types too)
import type { Feature, Polygon, MultiPolygon, Position } from "geojson";

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
import { BookText, Check, ChevronsUpDown } from "lucide-react";
import { FeatureJoyride } from "@/tutorial/FeatureJoyride";
import { DIFFERENCE_STEPS } from "@/tutorial/steps";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { toastMessage } from "../ToastMessage";

export interface DifferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DifferenceDialog({
  open,
  onOpenChange,
}: DifferenceDialogProps): ReactElement {
  const { layers, addLayer } = useLayers();
  const [runSteps, setRunSteps] = useState(false); // Whether to run the tutorial steps
  const [stepIndex, setStepIndex] = useState(0); // Track current step
  const [isLoading, setIsLoading] = useState(false); // Loading state for async operations

  const bookTrigger = (
    <Button onClick={() => setRunSteps(true)} variant="secondary" size="icon">
      <BookText
        style={{ width: "1.8rem", height: "1.8rem", fill: "#ff8847" }}
      />
    </Button>
  );

  function handleTutorialStop() {
    setRunSteps(false);
    setStepIndex(0); // Reset step index when tour stops
  }

  function handleStepChange(newStepIndex: number) {
    setStepIndex(
      Math.max(0, Math.min(newStepIndex, DIFFERENCE_STEPS.length - 1))
    );
  }

  // —— form state ——
  const [baseLayerId, setBaseLayerId] = useState<string | null>(null);
  const [subtractLayerIds, setSubtractLayerIds] = useState<string[]>([]);
  const [layerName, setLayerName] = useState<string>("");
  const [fillColor, setFillColor] = useState<string>(getUniqueColor());
  const [fillOpacity, setFillOpacity] = useState<number>(1);
  const [errors, setErrors] = useState<{ base: boolean; subtract: boolean }>({
    base: false,
    subtract: false,
  });

  // ───────────────────────────────────────────────────────── handlers ────
  async function onSave() {
    setIsLoading(true);

    const hasErr = !baseLayerId || subtractLayerIds.length === 0;
    setErrors({ base: !baseLayerId, subtract: subtractLayerIds.length === 0 });

    if (hasErr) {
      setIsLoading(false);
      return;
    }

    try {
      /* micro-delay so the loader is guaranteed to appear */
      await new Promise((r) => setTimeout(r, 0));
      const success = await handleDifference(
        baseLayerId!,
        subtractLayerIds,
        layerName
      );
      if (!success) return;

      onOpenChange(false);
      resetForm();
      toastMessage({
        title: "Difference Created",
        description: `Difference layer "${layerName}" created successfully.`,
        icon: Check,
      });
    } catch (err) {
      console.error("Difference operation failed:", err);
      /* optional toast */
    } finally {
      setIsLoading(false);
    }
  }

  /* helper */
  function resetForm() {
    setBaseLayerId(null);
    setSubtractLayerIds([]);
    setLayerName("");
    setFillColor(getUniqueColor());
    setFillOpacity(1);
    setErrors({ base: false, subtract: false });
  }

  useEffect(() => {
    // Reset layer selection if dialog is closed
    if (!open) {
      setBaseLayerId(null);
      setSubtractLayerIds([]);
      setLayerName("");
      setFillColor(getUniqueColor());
      setFillOpacity(1);
      setErrors({ base: false, subtract: false });
    }
  }, [open]);

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
        console.warn("Union failed, falling back to MultiPolygon merge: ", err);
      }
    }
    // manual merge fallback
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

  function safeDifference(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {
    try {
      const res = turf.difference(a as any, b as any);
      if (res) return res as Feature<Polygon | MultiPolygon>;
    } catch (err) {
      console.warn("Difference failed, returning original geometry", err);
    }
    return a;
  }

  async function handleDifference(
    baseId: string,
    subtractIds: string[],
    outName: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        try {
          const baseLayer = layers.find((l) => l.id === baseId);
          const subtractLayers = layers.filter((l) =>
            subtractIds.includes(l.id)
          );

          if (!baseLayer || subtractLayers.length === 0) {
            resolve(false);
            return;
          }

          // build unified base
          let baseGeom: Feature<Polygon | MultiPolygon> | null = null;
          turf.flattenEach(
            baseLayer.data as AllGeoJSON,
            (feat: Feature<Polygon | MultiPolygon>) => {
              baseGeom = baseGeom
                ? safeUnion(baseGeom, feat as Feature<Polygon | MultiPolygon>)
                : (feat as Feature<Polygon | MultiPolygon>);
            }
          );
          if (!baseGeom) {
            resolve(false);
            return;
          }

          // unified subtract
          let subtractGeom: Feature<Polygon | MultiPolygon> | null = null;
          for (const lyr of subtractLayers) {
            turf.flattenEach(
              lyr.data as AllGeoJSON,
              (feat: Feature<Polygon | MultiPolygon>) => {
                subtractGeom = subtractGeom
                  ? safeUnion(subtractGeom, feat)
                  : feat;
              }
            );
          }
          if (!subtractGeom) return false;

          // diff
          const diffGeom = safeDifference(baseGeom, subtractGeom);
          if (!diffGeom) {
            console.warn("Difference resulted in no geometry");
            resolve(false);
          }

          const outFeature = turf.feature(diffGeom.geometry);
          const outFC = turf.featureCollection([outFeature]);
          const geometryType = outFeature.geometry.type as
            | "Polygon"
            | "MultiPolygon";

          addLayer(
            {
              data: outFC,
              name: outName || getUniqueLayerName("difference"),
              id: uuidv4(),
              visible: true,
              fillColor,
              fillOpacity,
              geometryType,
            },
            fillColor,
            fillOpacity
          );
          resolve(true);
        } catch (err) {
          console.error("Difference failed:", err);
          reject(err);
        }
      }, 0);
    });
  }

  return (
    <>
      <ToolDialogShell
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) {
            resetForm();
            setIsLoading(false); // 👈
          }
        }}
        title="Difference"
        description="Creates a new polygon layer representing the difference between a base polygon layer and one or more subtract polygon layers."
        onSave={onSave}
        actions={bookTrigger}
        saveButtonClassName="difference-btn"
      >
        <div className="difference-tool">
          <DifferenceTool
            baseLayerId={baseLayerId}
            setBaseLayerId={setBaseLayerId}
            subtractLayerIds={subtractLayerIds}
            setSubtractLayerIds={setSubtractLayerIds}
            setLayerName={setLayerName}
            errors={errors}
          />
        </div>
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <Bouncy color="#ff8847" size={60} />
          </div>
        )}

        <div className="difference-styles">
          <LayerSettingsForm
            layerName={layerName}
            onNameChange={setLayerName}
            fillColor={fillColor}
            fillOpacity={fillOpacity}
            onFillColorChange={setFillColor}
            onFillOpacityChange={setFillOpacity}
          />
        </div>
      </ToolDialogShell>

      <FeatureJoyride
        steps={DIFFERENCE_STEPS}
        run={runSteps && open}
        onStop={handleTutorialStop}
        stepIndex={stepIndex}
        onStepChange={handleStepChange}
        disableOverlay
      />
    </>
  );
}

// ======================================================================
interface DifferenceToolProps {
  baseLayerId: string | null;
  setBaseLayerId: (id: string | null) => void;
  subtractLayerIds: string[];
  setSubtractLayerIds: Dispatch<SetStateAction<string[]>>;
  setLayerName: (name: string) => void;
  errors: { base: boolean; subtract: boolean };
}

function DifferenceTool({
  baseLayerId,
  setBaseLayerId,
  subtractLayerIds,
  setSubtractLayerIds,
  setLayerName,
  errors,
}: DifferenceToolProps): ReactElement {
  const { layers } = useLayers();
  const [baseOpen, setBaseOpen] = useState(false);
  const [subtractOpen, setSubtractOpen] = useState(false);

  const polygonLayers = layers.filter(
    (l) => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon"
  );

  // helpers
  const toggleSubtractLayer = (id: string, name: string) => {
    setSubtractLayerIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (baseLayerId && !name.includes("-diff")) {
        const baseName = layers.find((l) => l.id === baseLayerId)?.name || "";
        setLayerName(getUniqueLayerName(`${baseName}-diff`));
      }
      return next;
    });
    // do not close; allow multi-select
  };

  const selectBaseLayer = (id: string, name: string) => {
    setBaseLayerId(baseLayerId === id ? null : id);
    if (!name.includes("-diff"))
      setLayerName(getUniqueLayerName(`${name}-diff`));
    setSubtractLayerIds((prev) => prev.filter((x) => x !== id)); // ensure not both base & subtract
    setBaseOpen(false);
  };

  const baseLabel = baseLayerId
    ? layers.find((l) => l.id === baseLayerId)?.name ?? "Choose base layer"
    : "Choose base layer";
  const subtractLabel =
    subtractLayerIds.length === 0
      ? "Choose subtract layers"
      : `${subtractLayerIds.length} layer${
          subtractLayerIds.length > 1 ? "s" : ""
        } selected`;

  return (
    <>
      <div className="mb-2 ml-1 mr-1 flex flex-row gap-3">
        {/* Base layer select */}
        <Popover open={baseOpen} onOpenChange={setBaseOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              className={cn(
                "w-[230px] justify-between difference-base-layer",
                errors.base && "border-red-500 border-2"
              )}
            >
              {baseLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[230px] p-0"
            aria-label="Base layer list"
          >
            <Command>
              <CommandInput placeholder="Search layer..." />
              <CommandList>
                <CommandEmpty>No polygon layers found.</CommandEmpty>
                <CommandGroup>
                  {polygonLayers.map((layer) => {
                    const isChecked = baseLayerId === layer.id;
                    return (
                      <CommandItem
                        key={layer.id}
                        value={layer.name}
                        onSelect={() => selectBaseLayer(layer.id, layer.name)}
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

        {/* Subtract layers select */}
        <Popover open={subtractOpen} onOpenChange={setSubtractOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              className={cn(
                "w-[230px] justify-between difference-subtract-layer",
                errors.subtract && "border-red-500 border-2"
              )}
            >
              {subtractLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[230px] p-0"
            aria-label="Subtract layer list"
          >
            <Command>
              <CommandInput placeholder="Search layer..." />
              <CommandList>
                <CommandEmpty>No polygon layers found.</CommandEmpty>
                <CommandGroup>
                  {polygonLayers
                    .filter((l) => l.id !== baseLayerId) // exclude base layer
                    .map((layer) => {
                      const isChecked = subtractLayerIds.includes(layer.id);
                      return (
                        <CommandItem
                          key={layer.id}
                          value={layer.name}
                          onSelect={() =>
                            toggleSubtractLayer(layer.id, layer.name)
                          }
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
      </div>
      <div className="text-red-500 text-sm m-auto text-center mb-2">
        {errors.base && errors.subtract ? (
          <p className="text-sm">
            Select a base polygon layer and at least one subtract polygon layer.
          </p>
        ) : errors.base ? (
          <p className="text-sm">Select a base polygon layer.</p>
        ) : errors.subtract ? (
          <p className="text-sm">Select at least one subtract polygon layer.</p>
        ) : null}
      </div>
    </>
  );
}
