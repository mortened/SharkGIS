import { useState } from "react";
import { ToolDialogShell } from "./ToolDialogShell";
import DissolveTool from "./DissolveTool";
import { useLayers } from "@/hooks/useLayers";
import { v4 as uuidv4 } from "uuid";
import type {
  Feature,
  Polygon,
  MultiPolygon,
  FeatureCollection,
} from "geojson";
import * as turf from "@turf/turf";
import { LayerSettingsForm } from "../layers/LayerSettingsForm";
import { getUniqueColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookText, Check } from "lucide-react";
import { FeatureJoyride } from "@/tutorial/FeatureJoyride";
import { DISSOLVE_STEPS } from "@/tutorial/steps";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { toastMessage } from "../ToastMessage";

interface DissolveDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export default function DissolveDialog({
  open,
  onOpenChange,
}: DissolveDialogProps) {
  const { layers, addLayer, removeLayer } = useLayers();

  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [dissolveField, setDissolveField] = useState<string | null>(null);
  const [layerName, setLayerName] = useState("");
  const [fillColor, setFillColor] = useState(getUniqueColor());
  const [fillOpacity, setFillOpacity] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [keepInputLayers, setKeepInputLayers] = useState(true);
  const [errors, setErrors] = useState<{ layer: boolean }>({
    layer: false,
  });

  // Joyride state
  const [runSteps, setRunSteps] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  // Trigger button for the tutorial
  const bookTrigger = (
    <Button onClick={() => setRunSteps(true)} variant="secondary" size="icon">
      <BookText
        style={{ width: "1.8rem", height: "1.8rem", fill: "#ff8847" }}
      />
    </Button>
  );
  // Handler to stop the tutorial
  function handleTutorialStop() {
    setRunSteps(false);
    setStepIndex(0);
  }
  // Handler to change the step index
  function handleStepChange(newStepIndex: number) {
    setStepIndex(
      Math.max(0, Math.min(newStepIndex, DISSOLVE_STEPS.length - 1))
    );
  }
  // Reset form state
  const resetForm = () => {
    setSelectedLayerId("");
    setDissolveField(null);
    setLayerName("");
    setFillColor(getUniqueColor());
    setKeepInputLayers(true);
    setErrors({ layer: false });
  };
  // async function to handle saving the dissolve operation
  async function onSave() {
    setIsLoading(true);
    // Validate inputs
    const hasLayer = !!selectedLayerId;

    if (!hasLayer) {
      setErrors({
        layer: !hasLayer,
      });
      setIsLoading(false);
      return;
    }
    // wrap the dissolve operation in a try-catch block
    try {
      // Use setTimeout to yield control back to React for rendering
      await new Promise((resolve) => setTimeout(resolve, 0));

      const success = await handleDissolve(selectedLayerId, dissolveField);
      // if not successful, show error toast and reset loading state
      if (!success) {
        toastMessage({
          title: "Dissolve Failed",
          description: "No valid polygon features found to dissolve.",
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }

      // Update toast message based on whether input layers were kept or removed
      const action = keepInputLayers
        ? "created"
        : "created and input layer removed";

      toastMessage({
        title: "Dissolve Completed",
        description: `Dissolved layer "${layerName}" ${action} successfully!`,
        icon: Check,
        duration: 3500,
      });

      setIsLoading(false);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Dissolve operation failed:", error);
      toastMessage({
        title: "Dissolve Failed",
        description: `Dissolve operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration: 4000,
      });
      setIsLoading(false);
    }
  }
  // Function to validate polygon and multipolygon geometries
  function validateGeometry(feature: Feature<Polygon | MultiPolygon>): boolean {
    try {
      if (!feature.geometry || !feature.geometry.coordinates) {
        return false;
      }

      if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates;
        if (!coords || coords.length === 0) return false;

        // Check each ring (exterior + holes)
        for (const ring of coords) {
          if (!ring || ring.length < 4) return false;

          // Check if ring is closed (first and last coordinates are the same)
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (!first || !last || first.length < 2 || last.length < 2)
            return false;
          if (
            Math.abs(first[0] - last[0]) > 1e-10 ||
            Math.abs(first[1] - last[1]) > 1e-10
          ) {
            return false;
          }
        }

        return true;
      } else if (feature.geometry.type === "MultiPolygon") {
        const coords = feature.geometry.coordinates;
        if (!coords || coords.length === 0) return false;

        // Check each polygon in the multipolygon
        for (const polygon of coords) {
          if (!polygon || polygon.length === 0) return false;

          // Check each ring in this polygon
          for (const ring of polygon) {
            if (!ring || ring.length < 4) return false;

            // Check if ring is closed
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (!first || !last || first.length < 2 || last.length < 2)
              return false;
            if (
              Math.abs(first[0] - last[0]) > 1e-10 ||
              Math.abs(first[1] - last[1]) > 1e-10
            ) {
              return false;
            }
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.warn("Geometry validation error:", error);
      return false;
    }
  }
  // Function to handle the dissolve operation
  async function handleDissolve(
    layerId: string,
    field: string | null
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Use setTimeout to yield control back to React for rendering
      setTimeout(() => {
        try {
          const src = layers.find((l) => l.id === layerId);
          if (!src) {
            throw new Error("Source layer not found");
          }

          // Filter to only polygon/multipolygon features
          const polygonFeatures = src.data.features.filter(
            (f) =>
              f.geometry &&
              (f.geometry.type === "Polygon" ||
                f.geometry.type === "MultiPolygon")
          ) as Feature<Polygon | MultiPolygon>[];
          // If no polygon features found, resolve with false
          if (polygonFeatures.length === 0) {
            console.error(
              "No polygon or multipolygon features found in the selected layer"
            );
            resolve(false);
            return;
          }

          // Validate geometries
          const validFeatures = polygonFeatures.filter((f) =>
            validateGeometry(f)
          );
          // If no valid features found, resolve with false
          if (validFeatures.length === 0) {
            console.error("No valid polygon geometries found");
            resolve(false);
            return;
          }
          // Log the number of valid features found
          console.log(
            `Found ${validFeatures.length} valid features out of ${polygonFeatures.length} total polygon features`
          );
          // If a dissolve field is specified, group by that field
          if (field) {
            // Dissolve by field - create ONE feature for each unique attribute value
            const groups: Record<string, Feature<Polygon | MultiPolygon>[]> =
              {};
            // Group features by the specified field
            validFeatures.forEach((f) => {
              const value = f.properties?.[field];
              const key =
                value !== undefined && value !== null
                  ? String(value)
                  : "__null__";
              if (!groups[key]) {
                groups[key] = [];
              }
              groups[key].push(f);
            });
            // initialize an array to hold dissolved features
            const dissolvedFeatures: Feature<Polygon | MultiPolygon>[] = [];
            // Iterate over each group and dissolve the features
            for (const [key, feats] of Object.entries(groups)) {
              const dissolvedFeature = dissolveGroup(feats, field, key);
              if (dissolvedFeature) {
                dissolvedFeatures.push(dissolvedFeature);
              }
            }
            // If no features were dissolved, log an error and resolve with false
            if (dissolvedFeatures.length === 0) {
              console.error("No features were successfully dissolved");
              resolve(false);
              return;
            }

            // create a new layer with the dissolved features
            const newLayer = {
              id: uuidv4(),
              name: layerName,
              data: {
                type: "FeatureCollection" as const,
                features: dissolvedFeatures,
              },
              fillColor: fillColor,
              fillOpacity: fillOpacity,
              visible: true,
              geometryType: "Polygon" as const,
            };
            // Add the new layer to the map
            addLayer(newLayer, fillColor, fillOpacity);
          } else {
            // No field - dissolve ALL into ONE feature
            const singleFeature = dissolveAllIntoOne(validFeatures);
            // If no single feature was created, log an error and resolve with false
            if (!singleFeature) {
              console.error(
                "Failed to dissolve all features into single feature"
              );
              resolve(false);
              return;
            }

            // Add result to map
            const newLayer = {
              id: uuidv4(),
              name: layerName,
              data: {
                type: "FeatureCollection" as const,
                features: [singleFeature],
              },
              fillColor: fillColor,
              fillOpacity: fillOpacity,
              visible: true,
              geometryType: "Polygon" as const,
            };

            addLayer(newLayer, fillColor, fillOpacity);
          }

          // Remove input layer if user chose not to keep it
          if (!keepInputLayers) {
            removeLayer(layerId);
          }

          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
  }
  // Function to dissolve a group of features based on a field
  function dissolveGroup(
    feats: Feature<Polygon | MultiPolygon>[],
    field: string,
    key: string
  ): Feature<Polygon | MultiPolygon> | null {
    try {
      if (feats.length === 0) return null;

      if (feats.length === 1) {
        // Single feature - just return it with the correct properties
        return {
          ...feats[0],
          properties: { [field]: key === "__null__" ? null : key },
        };
      }

      // Multiple features - use turf dissolve for proper boundary removal
      const fc: FeatureCollection<Polygon | MultiPolygon> = {
        type: "FeatureCollection",
        features: feats,
      };

      try {
        // Use turf dissolve which should properly merge adjacent polygons
        const dissolved = turf.dissolve(fc, { propertyName: field });

        if (dissolved.features.length > 0) {
          // If dissolve worked, return the first (and typically only) result
          const result = dissolved.features[0];
          return {
            ...result,
            properties: { [field]: key === "__null__" ? null : key },
          };
        } else {
          throw new Error("Dissolve returned no features");
        }
      } catch (dissolveError) {
        console.warn(
          `Turf dissolve failed for group ${key}, trying union approach:`,
          dissolveError
        );

        // Fallback: try using turf union to merge polygons
        try {
          let result = feats[0];
          for (let i = 1; i < feats.length; i++) {
            result = turf.union(result, feats[i]) as Feature<
              Polygon | MultiPolygon
            >;
          }

          return {
            ...result,
            properties: { [field]: key === "__null__" ? null : key },
          };
        } catch (unionError) {
          console.warn(`Union also failed for group ${key}:`, unionError);

          // Last fallback: just combine as MultiPolygon without merging
          let allCoordinates: number[][][][] = [];

          feats.forEach((feature) => {
            if (feature.geometry.type === "Polygon") {
              allCoordinates.push(feature.geometry.coordinates);
            } else if (feature.geometry.type === "MultiPolygon") {
              allCoordinates.push(...feature.geometry.coordinates);
            }
          });

          if (allCoordinates.length === 0) return null;

          return {
            type: "Feature",
            geometry: {
              type: "MultiPolygon",
              coordinates: allCoordinates,
            },
            properties: { [field]: key === "__null__" ? null : key },
          };
        }
      }
    } catch (error) {
      console.warn(`Failed to dissolve group ${key}:`, error);
      return null;
    }
  }
  // Function to dissolve all features into one, removing internal boundaries
  function dissolveAllIntoOne(
    features: Feature<Polygon | MultiPolygon>[]
  ): Feature<Polygon | MultiPolygon> | null {
    try {
      if (features.length === 1) {
        return {
          ...features[0],
          properties: {}, // Clear properties for "dissolve all"
        };
      }

      // Try to dissolve all features together
      const fc: FeatureCollection<Polygon | MultiPolygon> = {
        type: "FeatureCollection",
        features: features,
      };

      try {
        // Use turf dissolve
        const dissolved = turf.dissolve(fc);

        if (dissolved.features.length > 0) {
          // If we get multiple features back, union them together
          let result = dissolved.features[0];
          for (let i = 1; i < dissolved.features.length; i++) {
            result = turf.union(result, dissolved.features[i]) as Feature<
              Polygon | MultiPolygon
            >;
          }

          return {
            ...result,
            properties: {}, // No attributes for "dissolve all"
          };
        } else {
          throw new Error("Dissolve returned no features");
        }
      } catch (dissolveError) {
        console.warn(
          "Turf dissolve failed, trying union approach:",
          dissolveError
        );

        // Fallback: try using turf union
        try {
          let result = features[0];
          for (let i = 1; i < features.length; i++) {
            result = turf.union(result, features[i]) as Feature<
              Polygon | MultiPolygon
            >;
          }

          return {
            ...result,
            properties: {}, // No attributes for "dissolve all"
          };
        } catch (unionError) {
          console.warn(
            "Union also failed, combining without dissolving:",
            unionError
          );

          // Last fallback: combine all coordinates
          let allCoordinates: number[][][][] = [];

          features.forEach((feature) => {
            if (feature.geometry.type === "Polygon") {
              allCoordinates.push(feature.geometry.coordinates);
            } else if (feature.geometry.type === "MultiPolygon") {
              allCoordinates.push(...feature.geometry.coordinates);
            }
          });

          if (allCoordinates.length === 0) return null;

          return {
            type: "Feature",
            geometry: {
              type: "MultiPolygon",
              coordinates: allCoordinates,
            },
            properties: {},
          };
        }
      }
    } catch (error) {
      console.warn("Failed to dissolve all features:", error);
      return null;
    }
  }

  return (
    <>
      <ToolDialogShell
        open={open}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            resetForm();
            setIsLoading(false);
          }
        }}
        title="Dissolve"
        onSave={onSave}
        description={
          dissolveField
            ? `Merges all polygons that share the same value in "${dissolveField}" into single features, removing internal boundaries.`
            : "Merges all polygons of the selected layer into one feature, removing internal boundaries."
        }
        actions={bookTrigger}
        saveButtonClassName="dissolve-btn"
        keepInputLayer={keepInputLayers}
        onKeepInputLayerChange={setKeepInputLayers}
        showKeepInputLayerToggle={true}
      >
        <div className="dissolve-tool">
          <DissolveTool
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
            dissolveField={dissolveField}
            setDissolveField={setDissolveField}
            layerName={layerName}
            setLayerName={setLayerName}
            errors={errors}
          />

          {isLoading && (
            <div className="flex justify-center items-center mt-4">
              <Bouncy color="#ff8847" size={60} />
            </div>
          )}

          <div className="dissolve-form">
            <LayerSettingsForm
              layerName={layerName}
              onNameChange={setLayerName}
              fillColor={fillColor}
              fillOpacity={fillOpacity}
              onFillColorChange={setFillColor}
              onFillOpacityChange={setFillOpacity}
            />
          </div>
        </div>
      </ToolDialogShell>

      <FeatureJoyride
        steps={DISSOLVE_STEPS}
        run={runSteps && open}
        onStop={handleTutorialStop}
        stepIndex={stepIndex}
        onStepChange={handleStepChange}
        disableOverlay
      />
    </>
  );
}
