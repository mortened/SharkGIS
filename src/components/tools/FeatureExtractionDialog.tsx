import { useState } from "react"
import { FeatureExtractionDialogShell } from "./FeatureExtractionDialogShell"
import FeatureExtractionTool from "./FeatureExtractionTool"
import { useAttributeTable } from "@/stores/useAttributeTable"
import { useLayers } from "@/hooks/useLayers"
import type { FeatureCollection } from "geojson"
import { featureKey, getUniqueColor, getUniqueLayerName } from "@/lib/utils"

interface FeatureExtractionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeatureExtractionDialog({ open, onOpenChange }: FeatureExtractionDialogProps) {
    const [selectedLayerId, setSelectedLayerId] = useState("")
    const { clearFilters, selectedFeatures } = useAttributeTable()
    const { layers, addLayer } = useLayers()

    function onSave() {
        const selectedLayer = layers.find(layer => layer.id === selectedLayerId)
        if (!selectedLayer) return

        // Filter the selected features
        const feats = selectedLayer.data.features
        const selectedFeaturesData = feats.filter((f, idx) => selectedFeatures.includes(featureKey(f, idx)));
        // Check if there are any selected features
        if (selectedFeaturesData.length === 0) {
            console.log("No features selected")
            return
        }

        // Create a new FeatureCollection with only the selected features
        const selectedFeaturesCollection: FeatureCollection = {
            type: "FeatureCollection",
            features: selectedFeaturesData,
        }

        // Generate a unique ID for the new layer
        const newLayerId = `extracted_${selectedLayerId}_${Date.now()}`
        
        // Create a new layer name based on the original layer
        const newLayerName = getUniqueLayerName(
            `${selectedLayer.name}-extracted`
        )

        // Add the new layer with a different color
        addLayer({
            id: newLayerId,
            name: newLayerName,
            data: selectedFeaturesCollection,
            fillColor: getUniqueColor(), // Red color for extracted features
            fillOpacity: 0.7,
            visible: true,
            geometryType: selectedLayer.geometryType
        }, getUniqueColor(), 0.7)

        onOpenChange(false)
        clearFilters()
    }

    // Add this function to handle dialog close
    function handleOpenChange(newOpen: boolean) {
        if (!newOpen) {
            clearFilters() // Clear filters when dialog closes
        }
        onOpenChange(newOpen)
    }

    return (
        <FeatureExtractionDialogShell
            open={open}
            onOpenChange={handleOpenChange} // Use the new handler
            title="Feature Extraction"
            description="Extract features based on attribute values"
            onSave={onSave}
        >
            <div className="h-[calc(100vh-300px)]">
                <FeatureExtractionTool
                    selectedLayerId={selectedLayerId}
                    setSelectedLayerId={setSelectedLayerId}
                />
            </div>
        </FeatureExtractionDialogShell>
    )
}
