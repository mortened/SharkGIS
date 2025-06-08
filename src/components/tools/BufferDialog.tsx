"use client";
import { useState } from "react";
import { ToolDialogShell } from "./ToolDialogShell";
import BufferTool from "./BufferTool";
import * as turf from "@turf/turf";
import { useLayers } from "@/hooks/useLayers";
import { v4 as uuidv4 } from "uuid";
import { LayerSettingsForm } from "../layers/LayerSettingsForm";
import { getUniqueColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookText, Check } from "lucide-react";
import { FeatureJoyride } from "@/tutorial/FeatureJoyride";
import { BUFFER_STEPS } from "@/tutorial/steps";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { toastMessage } from "../ToastMessage";

interface BufferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BufferDialog({ open, onOpenChange }: BufferDialogProps) {
  /* ─────────────── form & validation state ─────────────── */
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [bufferDistance, setBufferDistance] = useState<number | null>(null);
  const [layerName, setLayerName] = useState("");
  const [fillColor, setFillColor] = useState(getUniqueColor());
  const [fillOpacity, setFillOpacity] = useState(1);
  const [errors, setErrors] = useState<{ layer: boolean; distance: boolean }>({
    layer: false,
    distance: false,
  });

  /* ─────────────── loader state ─────────────── */
  const [isLoading, setIsLoading] = useState(false);

  /* ─────────────── tutorial state ─────────────── */
  const [runSteps, setRunSteps] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const { layers, addLayer } = useLayers();

  /* ——————————————————————————————————————————  handlers  —————————————————————————————————————————— */

  /** Actually performs the buffering; wrapped in setTimeout so the loader can render first */
  async function handleBuffer(selId: string, distance: number, name: string) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          const src = layers.find((l) => l.id === selId);
          if (!src) throw new Error("Layer not found");

          const buffered = turf.buffer(src.data, distance, { units: "meters" });
          const firstFeature = buffered.features[0];
          const geomType =
            firstFeature?.geometry.type === "Polygon"
              ? "Polygon"
              : "MultiPolygon";

          addLayer(
            {
              id: uuidv4(),
              name,
              data: buffered,
              visible: true,
              fillColor,
              fillOpacity,
              geometryType: geomType,
            },
            fillColor,
            fillOpacity
          );

          resolve();
        } catch (err) {
          reject(err);
        }
      }, 0); // ← yield to React
    });
  }

  /** Save / submit button */
  async function onSave() {
    setIsLoading(true);

    const hasLayer = !!selectedLayerId;
    const hasDistance = !!bufferDistance;

    if (!hasLayer || !hasDistance) {
      setErrors({ layer: !hasLayer, distance: !hasDistance });
      setIsLoading(false);
      return;
    }

    try {
      // optional micro-delay so the loader is guaranteed to appear
      await new Promise((r) => setTimeout(r, 0));
      await handleBuffer(selectedLayerId, bufferDistance!, layerName);
      // success → close & reset
      onOpenChange(false);
      resetForm();
      toastMessage({
        title: "Buffer Created",
        description: `Buffer layer "${layerName}" created successfully.`,
        icon: Check,
      });
    } catch (err) {
      console.error("Buffer operation failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  /** Reset everything when dialog closes */
  const resetForm = () => {
    setSelectedLayerId("");
    setBufferDistance(null);
    setLayerName("");
    setFillColor(getUniqueColor());
    setErrors({ layer: false, distance: false });
  };

  /* ——————————————————————————————————————————  render  —————————————————————————————————————————— */

  return (
    <>
      <ToolDialogShell
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) {
            resetForm();
            setIsLoading(false);
          }
        }}
        title="Buffer"
        description="Create a polygon at a specified distance around the input layer."
        onSave={onSave}
        actions={
          <Button
            onClick={() => setRunSteps(true)}
            variant="secondary"
            size="icon"
          >
            <BookText
              style={{ width: "1.8rem", height: "1.8rem", fill: "#ff8847" }}
            />
          </Button>
        }
        saveButtonClassName="buffer-btn"
      >
        <div className="buffer-tool">
          <BufferTool
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
            bufferDistance={bufferDistance}
            setBufferDistance={setBufferDistance}
            layerName={layerName}
            setLayerName={setLayerName}
            errors={errors}
          />

          <LayerSettingsForm
            layerName={layerName}
            onNameChange={setLayerName}
            fillColor={fillColor}
            fillOpacity={fillOpacity}
            onFillColorChange={setFillColor}
            onFillOpacityChange={setFillOpacity}
          />

          {/* ——— loader ——— */}
          {isLoading && (
            <div className="flex justify-center items-center mt-4">
              <Bouncy color="#ff8847" size={60} />
            </div>
          )}
        </div>
      </ToolDialogShell>

      <FeatureJoyride
        steps={BUFFER_STEPS}
        run={runSteps && open}
        onStop={() => {
          setRunSteps(false);
          setStepIndex(0);
        }}
        stepIndex={stepIndex}
        onStepChange={(i) =>
          setStepIndex(Math.max(0, Math.min(i, BUFFER_STEPS.length - 1)))
        }
        disableOverlay
      />
    </>
  );
}
