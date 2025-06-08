import { useState } from "react";
import { FeatureExtractionDialogShell } from "./FeatureExtractionDialogShell";
import FeatureExtractionTool from "./FeatureExtractionTool";
import { useAttributeTable } from "@/stores/useAttributeTable";
import { useLayers } from "@/hooks/useLayers";
import type { FeatureCollection } from "geojson";
import { featureKey, getUniqueColor, getUniqueLayerName } from "@/lib/utils";
import {
  FEATURE_EXTRACTOR_STEPS_1,
  FEATURE_EXTRACTOR_STEPS_2,
} from "@/tutorial/steps";
import { FeatureJoyride } from "@/tutorial/FeatureJoyride";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { toastMessage } from "../ToastMessage";
import { Check } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

interface FeatureExtractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureExtractionDialog({
  open,
  onOpenChange,
}: FeatureExtractionDialogProps) {
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const { clearFilters, selectedFeatures } = useAttributeTable();
  const { layers, addLayer } = useLayers();
  const [runSteps, setRunSteps] = useState(false);
  const [stepIndex, setStepIndex] = useState(0); // Track current step
  const [isLoading, setLoading] = useState(false);
  const { phase } = useTutorial();

  function onSave() {
    setLoading(true);
    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
    if (!selectedLayer) return;

    // Filter the selected features
    const feats = selectedLayer.data.features;
    const selectedFeaturesData = feats.filter((f, idx) =>
      selectedFeatures.includes(featureKey(f, idx))
    );

    // Check if there are any selected features
    if (selectedFeaturesData.length === 0) {
      console.log("No features selected");
      return;
    }

    // Create a new FeatureCollection with only the selected features
    const selectedFeaturesCollection: FeatureCollection = {
      type: "FeatureCollection",
      features: selectedFeaturesData,
    };

    // Generate a unique ID for the new layer
    const newLayerId = `extracted_${selectedLayerId}_${Date.now()}`;

    // Create a new layer name based on the original layer
    const newLayerName = getUniqueLayerName(`${selectedLayer.name}-extracted`);

    // Add the new layer with a different color
    addLayer(
      {
        id: newLayerId,
        name: newLayerName,
        data: selectedFeaturesCollection,
        fillColor: getUniqueColor(), // Red color for extracted features
        fillOpacity: 0.7,
        visible: true,
        geometryType: selectedLayer.geometryType,
      },
      getUniqueColor(),
      0.7
    );

    onOpenChange(false);
    setLoading(false);
    toastMessage({
      title: "Features Extracted",
      description: `Extracted features from ${selectedLayer.name} and created a new layer.`,
      icon: Check,
    });
    clearFilters();
  }

  // Add this function to handle dialog close
  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      clearFilters(); // Clear filters when dialog closes
      setRunSteps(false); // Also stop the tutorial when dialog closes
      setStepIndex(0); // Reset step index to 0 when dialog closes
      setLoading(false);
    }
    onOpenChange(newOpen);
  }

  // Handle tutorial stop
  function handleTutorialStop() {
    setRunSteps(false);
    // Don't reset stepIndex here either - this preserves position for next time
  }

  // Handle step changes
  function handleStepChange(newStepIndex: number) {
    if (phase <= 5) {
      setStepIndex(
        Math.max(
          0,
          Math.min(newStepIndex, FEATURE_EXTRACTOR_STEPS_1.length - 1)
        )
      );
    } else {
      setStepIndex(
        Math.max(
          0,
          Math.min(newStepIndex, FEATURE_EXTRACTOR_STEPS_2.length - 1)
        )
      );
    }
  }

  return (
    <>
      <FeatureExtractionDialogShell
        open={open}
        onOpenChange={handleOpenChange} // Use the new handler
        title="Feature Extraction"
        description="Extract features based on attribute values"
        onSave={onSave}
        runSteps={runSteps}
        setRunSteps={setRunSteps}
      >
        <div className="h-[calc(100vh-300px)] feature-extraction">
          {isLoading && (
            <div className="flex justify-center align-center ">
              <Bouncy color="#ff8847" size={60} />
            </div>
          )}
          <FeatureExtractionTool
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
          />
        </div>
      </FeatureExtractionDialogShell>

      {/* Render Joyride in a portal with proper z-index coordination */}
      <FeatureJoyride
        steps={
          phase <= 6 ? FEATURE_EXTRACTOR_STEPS_1 : FEATURE_EXTRACTOR_STEPS_2
        }
        run={runSteps && open}
        onStop={handleTutorialStop}
        disableOverlay={true}
        stepIndex={stepIndex}
        onStepChange={handleStepChange}
      />
    </>
  );
}
