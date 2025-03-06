import { useLayers } from "@/hooks/useLayers";
import { useMapStore } from "@/hooks/useMapstore";
import LayerItem from "./LayerItem";
import { useState } from "react";
import clsx from "clsx";

export default function LayerList() {
  const { layers, removeLayer, toggleLayer, reorderLayers } = useLayers();
  const { isBaseVisible, toggleBaseVisibility } = useMapStore();

  const [isDraggedIndex, setIsDraggedIndex] = useState<number | null>(null);
  const [isDraggedOverIndex, setIsDraggedOverIndex] = useState<number | null>(null);

  // Toggle the base layer
  const handleBaseToggle = async () => {
    await toggleBaseVisibility();
  };

  // DRAG EVENTS
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, storeIndex: number) => {
    // Store the actual store index in dataTransfer
    event.dataTransfer.setData("text/plain", storeIndex.toString());
    event.currentTarget.classList.add("opacity-60");
    setIsDraggedIndex(storeIndex);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, storeIndex: number) => {
    event.preventDefault();
    if (isDraggedIndex !== null) {
      setIsDraggedOverIndex(storeIndex);
    }
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove("opacity-60");
    setIsDraggedIndex(null);
    setIsDraggedOverIndex(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, storeIndex: number) => {
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
    <div className="gap-2 p-3">
      {/* Base map item at the top */}
      <div className="text-sm italic text-gray-500">
      <LayerItem
        id="base"
        name="Base map"
        onDelete={() => {}}
        isVisible={isBaseVisible}
        onToggleVisibility={handleBaseToggle}
      />
    </div>   

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
              onDelete={() => removeLayer(layer.id)}
              isVisible={layer.visible}
              onToggleVisibility={() => toggleLayer(layer.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
