import { useLayers } from "@/hooks/useLayers";
import { useMapStore } from "@/hooks/useMapstore";
import LayerItem from "./LayerItem";
import { useState } from "react";

export default function LayerList() {
    const { layers, removeLayer, toggleLayer, reorderLayers } = useLayers();
    const { isBaseVisible, toggleBaseVisibility } = useMapStore();

    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const handleBaseToggle = async () => {
        console.log('Toggling base visibility')
        await toggleBaseVisibility();
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
        event.dataTransfer.setData("text/plain", index.toString());
        event.currentTarget.classList.add("dragging");
        setDraggingIndex(index);
    };

    const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.remove("dragging");
        setDraggingIndex(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>, index: number) => {
        const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
        if (fromIndex !== index) {
            reorderLayers(fromIndex, index);
            useMapStore.getState().updateMapLayers();
        }
        setDragOverIndex(null);
        setDraggingIndex(null);
    };

    const reversedLayers = [...layers].reverse();

    return (
        <div className="gap-2 p-3">
            <LayerItem 
                id="base" 
                name="Base map" 
                onDelete={() => {}} 
                isVisible={isBaseVisible}
                onToggleVisibility={handleBaseToggle}
            />
            {reversedLayers.map((layer, index) => (
                <div
                    key={layer.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(event) => handleDrop(event, index)}
                    onDragOver={(event) => event.preventDefault()}
                    className="layer-item cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all duration-300 rounded-md"
                >
                    <LayerItem 
                        id={layer.id} 
                        name={layer.name} 
                        onDelete={() => removeLayer(layer.id)}
                        isVisible={layer.visible}
                        onToggleVisibility={() => toggleLayer(layer.id)}
                    />
                </div>
            ))}
        </div>
    );
}