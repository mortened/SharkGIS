import { useLayers } from "@/hooks/useLayers";
import { useMapStore } from "@/hooks/useMapstore";
import LayerItem from "./LayerItem";
import { useState } from "react";
import clsx from "clsx";
import { toastMessage } from "../ToastMessage";
import { Trash2 } from "lucide-react";
import { ExportFormat } from "@/lib/utils";
import { saveAs } from "file-saver";
import GeoJsonToGpx from "@dwayneparton/geojson-to-gpx";

export default function LayerList() {
  const { layers, removeLayer, toggleLayer, reorderLayers } = useLayers();
  const { isBaseVisible, toggleBaseVisibility } = useMapStore();
  const [isDraggedIndex, setIsDraggedIndex] = useState<number | null>(null);
  const [isDraggedOverIndex, setIsDraggedOverIndex] = useState<number | null>(
    null
  );

  // Download layer as GeoJSON, gpx or png
  const downloadLayer = async (layerId: string, format: ExportFormat) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    // Build a GeoJSON FeatureCollection (works for any geometry)
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: layer.data.features,
    };
    // Create the Blob based on the format
    let blob: Blob;
    let filenameBase = layer.name.replace(/[^a-z0-9]/gi, "_");
    // different formats require different handling
    switch (format) {
      case "geojson":
        blob = new Blob([JSON.stringify(geojson, null, 2)], {
          type: "application/geo+json",
        });
        filenameBase += ".geojson";
        break;
      // GPX requires XML serialization
      case "gpx": {
        const doc = GeoJsonToGpx(geojson, { creator: "SharkGIS" });
        const gpxString = new XMLSerializer().serializeToString(doc);
        blob = new Blob([gpxString], { type: "application/gpx+xml" });
        filenameBase += ".gpx";
        break;
      }
      // PNG requires a Mapbox GL map instance
      case "png": {
        const map = useMapStore.getState().map;
        if (!map) return;

        await new Promise((res) => map.once("idle", res)); // ← important
        const pngBlob: Blob | null = await new Promise((res) =>
          map.getCanvas().toBlob(res, "image/png")
        );
        if (!pngBlob) return;

        saveAs(pngBlob, `${filenameBase}.png`);
        return; // PNG already saved; end early
      }

      default:
        return; // nothing to do
    }

    //   Trigger the download – anchor-hack or FileSaver
    saveAs(blob, filenameBase);
  };

  // Toggle the base layer
  const handleBaseToggle = async () => {
    await toggleBaseVisibility();
  };

  // DRAG EVENTS
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    storeIndex: number
  ) => {
    // Store the actual store index in dataTransfer
    event.dataTransfer.setData("text/plain", storeIndex.toString());
    event.currentTarget.classList.add("opacity-60");
    setIsDraggedIndex(storeIndex);
  };
  // Handle drag over to highlight the drop target
  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    storeIndex: number
  ) => {
    event.preventDefault();
    if (isDraggedIndex !== null) {
      setIsDraggedOverIndex(storeIndex);
    }
  };
  // Handle drag end to reset styles
  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove("opacity-60");
    setIsDraggedIndex(null);
    setIsDraggedOverIndex(null);
  };
  // Handle drop to reorder layers
  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    storeIndex: number
  ) => {
    const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== storeIndex) {
      // reorder using the real store indices
      reorderLayers(fromIndex, storeIndex);
      useMapStore.getState().updateMapLayers();
    }
    setIsDraggedOverIndex(null);
    setIsDraggedIndex(null);
  };

  // Reverse so the last layer in the store appears at the top in the UI
  const reversedLayers = [...layers].reverse();

  return (
    <div className="gap-2 p-3 layer-list">
      {reversedLayers.map((layer, reversedIndex) => {
        // Convert the reversed index to the actual store index
        const storeIndex = layers.length - 1 - reversedIndex;
        return (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, storeIndex)}
            onDragOver={(e) => handleDragOver(e, storeIndex)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, storeIndex)}
            className={clsx(
              "layer-item cursor-grab active:cursor-grabbing hover:bg-gray-100",
              "transition-all duration-300 rounded-md",
              // Highlight drop target with a border
              storeIndex === isDraggedOverIndex && "border-2 border-blue-400"
            )}
          >
            <LayerItem
              id={layer.id}
              name={layer.name}
              onDelete={() => {
                removeLayer(layer.id);
                toastMessage({
                  title: "Layer deleted",
                  description: `Layer "${layer.name}" has been deleted.`,
                  icon: Trash2,
                  backgroundColor: "#f87171",
                });
              }}
              onDownload={(fmt) => downloadLayer(layer.id, fmt)}
              isVisible={layer.visible}
              onToggleVisibility={() => toggleLayer(layer.id)}
            />
          </div>
        );
      })}
      {/* Base map item at the bottom */}
      <div className="text-sm italic text-gray-500">
        <LayerItem
          id="base"
          name="Base map"
          onDelete={() => {}}
          onDownload={() => {}}
          isVisible={isBaseVisible}
          onToggleVisibility={handleBaseToggle}
        />
      </div>
    </div>
  );
}
