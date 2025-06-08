import { useEffect, useState } from "react";
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
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { ToolDialogShell } from "./ToolDialogShell";
import { LayerSettingsForm } from "../layers/LayerSettingsForm";
import { Layer, useLayers } from "@/hooks/useLayers";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

export interface VoronoiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VoronoiDialog({
  open,
  onOpenChange,
}: VoronoiDialogProps) {
  const { layers, addLayer } = useLayers();
  const [inputLayerId, setInputLayerId] = useState("");
  const [error, setError] = useState(false);
  const [layerName, setLayerName] = useState("");
  const [fillOpacity, setFillOpacity] = useState(0.7);
  const [fillColor, setFillColor] = useState<string>(getUniqueColor());
  const [inputLayerOpen, setInputLayerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter to only show point layers
  const pointLayers = layers.filter(
    (l) => l.geometryType === "Point" || l.geometryType === "MultiPoint"
  );

  const inputLabel = inputLayerId
    ? layers.find((l) => l.id === inputLayerId)?.name ?? "Choose input layer"
    : "Choose input layer";

  const selectInputLayer = (id: string, name: string) => {
    setInputLayerId(id);
    if (name.includes("-voronoi")) {
      setLayerName(getUniqueLayerName(name));
    } else {
      setLayerName(getUniqueLayerName(`${name}-voronoi`));
    }
    setInputLayerOpen(false);
  };

  function onSave() {
    setIsLoading(true);
    const hasError = !inputLayerId;
    setError(hasError);
    if (hasError) return;

    const inputLayer = layers.find((l) => l.id === inputLayerId);
    if (!inputLayer) return;

    const success = handleVoronoi(inputLayer);
    if (success) {
      onOpenChange(false);
      setIsLoading(false);
    }
  }

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setInputLayerId("");
      setLayerName("");
      setFillColor(getUniqueColor());
      setFillOpacity(0.7);
      setInputLayerOpen(false);
      setError(false);
      setIsLoading(false);
    }
  }, [open]);

  function handleVoronoi(inputLayer: Layer): boolean {
    try {
      // Extract all points from the layer
      const points: turf.Feature<turf.Point>[] = [];

      inputLayer.data.features.forEach((feature) => {
        if (feature.geometry.type === "Point") {
          points.push(feature as turf.Feature<turf.Point>);
        } else if (feature.geometry.type === "MultiPoint") {
          feature.geometry.coordinates.forEach((coord) => {
            points.push(turf.point(coord, feature.properties));
          });
        }
      });

      if (points.length < 3) {
        console.error("Voronoi requires at least 3 points");
        return false;
      }

      // Create feature collection and calculate bounding box
      const pointsFC = turf.featureCollection(points);
      const bbox = turf.bbox(pointsFC);

      // Generate Voronoi diagram
      const voronoiPolygons = turf.voronoi(pointsFC, { bbox: bbox });

      if (!voronoiPolygons || voronoiPolygons.features.length === 0) {
        console.error("Failed to generate Voronoi polygons");
        return false;
      }

      // Ensure all features have valid geometry
      const validFeatures = voronoiPolygons.features.filter(
        (feature) => feature.geometry && feature.geometry.type
      );

      if (validFeatures.length === 0) {
        console.error("No valid Voronoi polygons generated");
        return false;
      }

      // Create clean feature collection with valid features
      const cleanedVoronoi = turf.featureCollection(validFeatures);

      // Add the new layer - match the store's 3-parameter signature
      addLayer(
        {
          id: uuidv4(),
          name: layerName || getUniqueLayerName("voronoi"),
          data: cleanedVoronoi,
          fillColor,
          fillOpacity,
          visible: true,
          geometryType: "Polygon",
        },
        fillColor,
        fillOpacity
      );

      return true;
    } catch (err) {
      console.error("Error generating Voronoi diagram:", err);
      return false;
    }
  }

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setError(false);
      }}
      title="Voronoi"
      description="Creates a Voronoi polygon layer from an existing point layer."
      onSave={onSave}
    >
      {/* Layer picker */}
      <div className="mb-2 ml-1 mr-1 flex flex-row gap-3">
        <Popover open={inputLayerOpen} onOpenChange={setInputLayerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              className={cn(
                "w-full justify-between",
                error && "border-red-500 border-2"
              )}
            >
              {inputLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[250px] p-0"
            aria-label="Input layer list"
          >
            <Command>
              <CommandInput placeholder="Search layer…" />
              <CommandList>
                <CommandEmpty>No point layers found.</CommandEmpty>
                <CommandGroup>
                  {pointLayers.map((layer) => {
                    const checked = layer.id === inputLayerId;
                    return (
                      <CommandItem
                        key={layer.id}
                        value={layer.name}
                        onSelect={() => selectInputLayer(layer.id, layer.name)}
                        className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
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
      </div>
      {isLoading && (
        <div className="flex justify-center align-center ">
          <Bouncy color="#ff8847" size={60} />
        </div>
      )}

      {error && (
        <div className="mb-2 text-sm text-red-500">
          Please select an input layer.
        </div>
      )}

      {/* Layer settings form */}
      <LayerSettingsForm
        layerName={layerName}
        onNameChange={setLayerName}
        fillColor={fillColor}
        fillOpacity={fillOpacity}
        onFillColorChange={setFillColor}
        onFillOpacityChange={setFillOpacity}
      />
    </ToolDialogShell>
  );
}
