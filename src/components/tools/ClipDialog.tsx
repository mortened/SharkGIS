import { useState } from "react";
import type { ReactElement } from "react";
import * as turf from "@turf/turf";
import type { AllGeoJSON } from "@turf/helpers";
import { v4 as uuidv4 } from "uuid";

// Type-only geojson imports
import type {
  Feature,
  Position,
  Geometry,
  Point,
  MultiPoint,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
} from "geojson";

import { useLayers } from "@/hooks/useLayers";
import { ToolDialogShell } from "./ToolDialogShell";
import { LayerSettingsForm } from "../layers/LayerSettingsForm";
import { MultipleLayerSettingsForm } from "../layers/MultipleLayerSettingsForm";
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
import { CLIP_STEPS } from "@/tutorial/steps";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
/**
 * ClipDialog — Clips multiple *input* layers (points, lines or polygons) by one *polygon* clip layer.
 * Creates separate clipped layers for each input layer.
 */

export interface TempClippedLayer {
  inputLayerId: string;
  name: string;
  color: string;
  opacity: number;
}

export interface ClipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClipDialog({
  open,
  onOpenChange,
}: ClipDialogProps): ReactElement {
  const { layers, addLayer } = useLayers();
  const [runSteps, setRunSteps] = useState(false); // Whether to run the tutorial steps
  const [stepIndex, setStepIndex] = useState(0); // Track current step
  const [isLoading, setIsLoading] = useState(false);

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
    setStepIndex(Math.max(0, Math.min(newStepIndex, CLIP_STEPS.length - 1)));
  }

  // ——— form state ———
  const [inputLayerIds, setInputLayerIds] = useState<string[]>([]);
  const [clipLayerId, setClipLayerId] = useState<string>("");
  const [outputLayers, setOutputLayers] = useState<TempClippedLayer[]>([]);
  const [errors, setErrors] = useState<{ input: boolean; clip: boolean }>({
    input: false,
    clip: false,
  });

  function resetForm() {
    setIsLoading(false);
    setInputLayerIds([]);
    setClipLayerId("");
    setOutputLayers([]);
    setErrors({ input: false, clip: false });
  }

  // Update output layers when input selection changes
  const updateOutputLayers = (newInputLayerIds: string[]) => {
    const currentLayerIds = new Set(outputLayers.map((l) => l.inputLayerId));
    const usedColors = new Set(outputLayers.map((l) => l.color));

    // Add new layers
    const newLayers: TempClippedLayer[] = newInputLayerIds
      .filter((id) => !currentLayerIds.has(id))
      .map((id) => {
        const inputLayer = layers.find((l) => l.id === id);
        const uniqueColor = getUniqueColor([...usedColors]);
        usedColors.add(uniqueColor);

        return {
          inputLayerId: id,
          name: getUniqueLayerName(`${inputLayer?.name || "layer"}-clip`),
          color: uniqueColor,
          opacity: 0.8,
        };
      });

    // Keep existing layers that are still selected
    const keptLayers = outputLayers.filter((l) =>
      newInputLayerIds.includes(l.inputLayerId)
    );

    setOutputLayers([...keptLayers, ...newLayers]);
  };

  // ——— helpers ———
  /** Resilient polygon union */
  function safeUnion(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {
    try {
      const res = turf.union(a as any, b as any);
      if (res) return res as Feature<Polygon | MultiPolygon>;
    } catch (_) {
      /* swallow */
    }
    const coords: Position[][][] = [];
    const push = (f: Feature<Polygon | MultiPolygon>) => {
      if (f.geometry.type === "Polygon") coords.push(f.geometry.coordinates);
      else coords.push(...f.geometry.coordinates);
    };
    push(a);
    push(b);
    return turf.multiPolygon(coords) as Feature<Polygon | MultiPolygon>;
  }

  /** Clip a single Point / MultiPoint */
  function clipPoints(
    feat: Feature<Point | MultiPoint>,
    maskPoly: Feature<Polygon | MultiPolygon>
  ): Feature<Point | MultiPoint> | null {
    if (feat.geometry.type === "Point") {
      return turf.booleanPointInPolygon(feat, maskPoly) ? feat : null;
    }
    const kept: Position[] = feat.geometry.coordinates.filter((pt) =>
      turf.booleanPointInPolygon(turf.point(pt), maskPoly)
    );
    return kept.length ? turf.multiPoint(kept) : null;
  }
  function clipLine(
    feat: Feature<LineString | MultiLineString>,
    maskPoly: Feature<Polygon | MultiPolygon>
  ): Feature<LineString | MultiLineString> | null {
    // If the whole thing is already inside we can short-circuit.
    if (turf.booleanWithin(feat, maskPoly)) return feat;

    // 1️⃣ Convert polygon ring(s) to a cutter
    const cutter = turf.polygonToLine(maskPoly);

    // 2️⃣ Split the line wherever it meets the cutter
    const pieces = turf.lineSplit(feat, cutter);

    // 3️⃣ Keep only the pieces that lie inside the mask
    const kept = pieces.features.filter((ls: Feature<LineString>) => {
      const mid = turf.along(ls, turf.length(ls) / 2, { units: "kilometers" });
      return turf.booleanPointInPolygon(mid, maskPoly);
    });

    if (!kept.length) return null;
    if (kept.length === 1) return kept[0];

    return turf.multiLineString(
      kept.map((k: Feature<LineString>) => k.geometry.coordinates),
      feat.properties
    );
  }

  /** Clip a Polygon / MultiPolygon (intersection) */
  function clipPolygon(
    feat: Feature<Polygon | MultiPolygon>,
    maskPoly: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> | null {
    const res = turf.intersect(feat, maskPoly);
    return res ? (res as Feature<Polygon | MultiPolygon>) : null;
  }

  async function handleClip(): Promise<boolean> {
    return new Promise((resolve) => {
      // Use setTimeout to yield control back to React for rendering
      setTimeout(() => {
        try {
          const inputLayers = layers.filter((l) =>
            inputLayerIds.includes(l.id)
          );
          const clipLayer = layers.find((l) => l.id === clipLayerId);

          if (!inputLayers.length || !clipLayer) {
            resolve(false);
            return;
          }

          // —— build union mask ——
          let mask: Feature<Polygon | MultiPolygon> | null = null;
          turf.flattenEach(
            clipLayer.data as AllGeoJSON,
            (f: Feature<Polygon | MultiPolygon>) => {
              mask = mask
                ? safeUnion(mask!, f as Feature<Polygon | MultiPolygon>)
                : (f as Feature<Polygon | MultiPolygon>);
            }
          );

          if (!mask) {
            resolve(false);
            return;
          }

          // —— process each input layer separately ——
          let successCount = 0;

          for (const inputLayer of inputLayers) {
            const outputLayerSettings = outputLayers.find(
              (ol) => ol.inputLayerId === inputLayer.id
            );
            if (!outputLayerSettings) continue;

            const clippedFeatures: Feature<Geometry>[] = [];

            turf.flattenEach(
              inputLayer.data as AllGeoJSON,
              (f: Feature<Geometry>) => {
                const t = f.geometry.type;
                let clipped: Feature<Geometry> | null = null;

                if (t === "Point" || t === "MultiPoint") {
                  clipped = clipPoints(f as Feature<Point | MultiPoint>, mask!);
                } else if (t === "LineString" || t === "MultiLineString") {
                  clipped = clipLine(
                    f as Feature<LineString | MultiLineString>,
                    mask!
                  );
                } else if (t === "Polygon" || t === "MultiPolygon") {
                  clipped = clipPolygon(
                    f as Feature<Polygon | MultiPolygon>,
                    mask!
                  );
                }

                if (clipped) {
                  clippedFeatures.push({
                    ...clipped,
                    properties: f.properties,
                  });
                }
              }
            );

            if (clippedFeatures.length > 0) {
              const outFC = turf.featureCollection(clippedFeatures);

              addLayer(
                {
                  data: outFC,
                  name: getUniqueLayerName(outputLayerSettings.name),
                  id: uuidv4(),
                  visible: true,
                  fillColor: outputLayerSettings.color,
                  fillOpacity: outputLayerSettings.opacity,
                  geometryType: inputLayer.geometryType,
                },
                outputLayerSettings.color,
                outputLayerSettings.opacity
              );
              successCount++;
            }
          }

          resolve(successCount > 0);
        } catch (error) {
          console.error("Error during clipping operation:", error);
          resolve(false);
        }
      }, 0);
    });
  }

  // ——— save handler ———
  async function onSave() {
    setIsLoading(true);

    const errInput = !inputLayerIds.length;
    const errClip = !clipLayerId;
    setErrors({ input: errInput, clip: errClip });

    if (errInput || errClip) {
      setIsLoading(false);
      return;
    }

    const success = await handleClip();

    setIsLoading(false);

    if (!success) return;

    // Only close dialog after loading is complete
    onOpenChange(false);
    resetForm();
  }

  const updateOutputLayer = (
    index: number,
    patch: Partial<TempClippedLayer>
  ) => {
    setOutputLayers((prev) =>
      prev.map((layer, i) => (i === index ? { ...layer, ...patch } : layer))
    );
  };

  // Convert TempClippedLayer to format expected by MultipleLayerSettingsForm
  const tempLayersForForm = outputLayers.map((ol) => ({
    file: new File([], ol.name), // Dummy file object
    name: ol.name,
    color: ol.color,
    opacity: ol.opacity,
  }));

  const handleFormChange = (
    index: number,
    patch: { name?: string; color?: string; opacity?: number }
  ) => {
    updateOutputLayer(index, patch);
  };

  return (
    <>
      <ToolDialogShell
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) {
            setRunSteps(false);
            setStepIndex(0);
            setErrors({ input: false, clip: false });
            resetForm();
          }
        }}
        title="Clip"
        description="Clip multiple input layers using a single polygon clip layer."
        onSave={onSave}
        actions={bookTrigger}
        saveButtonClassName="clip-btn"
      >
        <ClipTool
          inputLayerIds={inputLayerIds}
          setInputLayerIds={(ids) => {
            setInputLayerIds(ids);
            updateOutputLayers(ids);
          }}
          clipLayerId={clipLayerId}
          setClipLayerId={(id) => {
            setClipLayerId(id);
            // Don't call updateOutputLayers here since it expects an array
          }}
          errors={errors}
        />

        {isLoading && (
          <div className="flex justify-center align-center ">
            <Bouncy color="#ff8847" size={60} />
          </div>
        )}

        <div className="clip-styles">
          {outputLayers.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                Output Layer Settings
              </h3>
              {outputLayers.length === 1 ? (
                <LayerSettingsForm
                  layerName={outputLayers[0].name}
                  onNameChange={(name) => updateOutputLayer(0, { name })}
                  fillColor={outputLayers[0].color}
                  onFillColorChange={(color) => updateOutputLayer(0, { color })}
                  fillOpacity={outputLayers[0].opacity}
                  onFillOpacityChange={(opacity) =>
                    updateOutputLayer(0, { opacity })
                  }
                />
              ) : (
                <MultipleLayerSettingsForm
                  layers={tempLayersForForm}
                  onChange={handleFormChange}
                />
              )}
            </div>
          )}
        </div>
      </ToolDialogShell>

      <FeatureJoyride
        steps={CLIP_STEPS}
        run={runSteps && open}
        onStop={handleTutorialStop}
        stepIndex={stepIndex}
        onStepChange={handleStepChange}
        disableOverlay
      />
    </>
  );
}

// —————————————————————————————————————————— UI —————————————————————————————————
interface ClipToolProps {
  inputLayerIds: string[];
  setInputLayerIds: (ids: string[]) => void;
  clipLayerId: string;
  setClipLayerId: (id: string) => void;
  errors: { input: boolean; clip: boolean };
}

function ClipTool({
  inputLayerIds,
  setInputLayerIds,
  clipLayerId,
  setClipLayerId,
  errors,
}: ClipToolProps): ReactElement {
  const { layers } = useLayers();
  const [inputOpen, setInputOpen] = useState(false);
  const [clipOpen, setClipOpen] = useState(false);

  const allLayers = layers; // any geometry for input
  const polygonLayers = layers.filter(
    (l) => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon"
  );

  const toggleInputLayer = (id: string) => {
    const newIds = inputLayerIds.includes(id)
      ? inputLayerIds.filter((x) => x !== id)
      : [...inputLayerIds, id];

    setInputLayerIds(newIds);

    // Remove from clip layer if it was selected there
    if (clipLayerId === id) {
      setClipLayerId("");
    }
    // keep open for multi-select
  };

  const selectClipLayer = (id: string) => {
    const newClipId = clipLayerId === id ? "" : id;
    setClipLayerId(newClipId);

    // Remove from input layers if it was selected there
    if (newClipId) {
      setInputLayerIds(inputLayerIds.filter((x) => x !== id));
    }
    setClipOpen(false);
  };

  const inputLabel = inputLayerIds.length
    ? `${inputLayerIds.length} input layer${
        inputLayerIds.length > 1 ? "s" : ""
      }`
    : "Choose input layers";

  const clipLabel = clipLayerId
    ? layers.find((l) => l.id === clipLayerId)?.name || "Choose clip polygon"
    : "Choose clip polygon";

  return (
    <>
      <div className="mb-2 ml-1 mr-1 flex flex-row gap-3">
        {/* Input layers */}
        <Popover open={inputOpen} onOpenChange={setInputOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              className={cn(
                "w-[230px] justify-between clip-input-layer",
                errors.input && "border-red-500 border-2"
              )}
            >
              {inputLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[230px] p-0"
            aria-label="Input layer list"
          >
            <Command>
              <CommandInput placeholder="Search layer..." />
              <CommandList>
                <CommandEmpty>No layers found.</CommandEmpty>
                <CommandGroup>
                  {allLayers
                    .filter((l) => l.id !== clipLayerId)
                    .map((layer) => {
                      const isChecked = inputLayerIds.includes(layer.id);
                      return (
                        <CommandItem
                          key={layer.id}
                          value={layer.name}
                          onSelect={() => toggleInputLayer(layer.id)}
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

        {/* Clip polygon */}
        <Popover open={clipOpen} onOpenChange={setClipOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              className={cn(
                "w-[230px] justify-between clip-clip-layer",
                errors.clip && "border-red-500 border-2"
              )}
            >
              {clipLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[230px] p-0"
            aria-label="Clip polygon list"
          >
            <Command>
              <CommandInput placeholder="Search layer..." />
              <CommandList>
                <CommandEmpty>No polygon layers found.</CommandEmpty>
                <CommandGroup>
                  {polygonLayers
                    .filter((l) => !inputLayerIds.includes(l.id))
                    .map((layer) => {
                      const isSelected = clipLayerId === layer.id;
                      return (
                        <CommandItem
                          key={layer.id}
                          value={layer.name}
                          onSelect={() => selectClipLayer(layer.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
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
        {errors.input && errors.clip ? (
          <p className="text-sm text-red-500">
            Select at least one input layer and one clip polygon layer.
          </p>
        ) : errors.input ? (
          <p className="text-sm text-red-500">
            Select at least one input layer.
          </p>
        ) : errors.clip ? (
          <p className="text-sm text-red-500">Select one clip polygon layer.</p>
        ) : null}
      </div>
    </>
  );
}
