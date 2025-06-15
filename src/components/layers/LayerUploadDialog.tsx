import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { Layer, useLayers } from "@/hooks/useLayers";
import { v4 as uuidv4 } from "uuid";
import { LayerSettingsForm } from "./LayerSettingsForm";
import { BadgeCheck, BookText, Cross } from "lucide-react";
import { getUniqueLayerName, getUniqueColor } from "@/lib/utils";
import { LayerUploadFiles } from "./LayerUploadFiles";
import {
  MultipleLayerSettingsForm,
  TempLayer,
} from "./MultipleLayerSettingsForm";
import { Button } from "../ui/button";
import { UPLOADSTEPS } from "@/tutorial/steps";
import { FeatureJoyride } from "@/tutorial/FeatureJoyride";
import { toastMessage } from "../ToastMessage";

interface LayerUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LayerUploadDialog({
  open,
  onOpenChange,
}: LayerUploadDialogProps) {
  const [, setLayerName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [, setFillColor] = useState(getUniqueColor());
  const [, setFillOpacity] = useState(0.8);
  const { addLayer } = useLayers();
  const [pending, setPending] = useState<TempLayer[]>([]);
  const [runSteps, setRunSteps] = useState(false);
  const [stepIndex, setStepIndex] = useState(0); // Track current step

  // Set name of the layer based on the file name if file is selected
  useEffect(() => {
    if (selectedFile) {
      const name = selectedFile.name.split(".").slice(0, -1).join(".");
      // Check if name is unique
      const uniqueName = getUniqueLayerName(name);
      setLayerName(uniqueName);
    }
  }, [selectedFile]);
  // Reset form when dialog opens
  function resetForm() {
    setLayerName("");
    setSelectedFile(null);
    setFillColor(getUniqueColor());
    setFillOpacity(0.8);
    setPending([]);
  }

  /* ---------- when user selects files ---------- */
  const handleFilesSelect = (files: File[]) => {
    // colours already taken by *queued* layers
    const taken = new Set<string>();

    const newPending: TempLayer[] = files.map((file) => {
      const color = getUniqueColor([...taken]);
      taken.add(color);
      // Create a temporary layer object
      return {
        file,
        name: getUniqueLayerName(file.name.replace(/\.geojson$/i, "")),
        color,
        opacity: 0.8, // default opacity
      };
    });

    setPending(newPending);
  };

  /* ---------- bulk‑add all layers ---------- */
  const handleAddLayers = async () => {
    for (const l of pending) {
      try {
        const json = JSON.parse(await l.file.text());

        addLayer(
          {
            data: json,
            id: uuidv4(),
            name: getUniqueLayerName(l.name),
            visible: true,
            fillColor: l.color,
            fillOpacity: l.opacity,
            geometryType: json.features[0].geometry
              .type as Layer["geometryType"],
          },
          l.color,
          l.opacity
        );
      } catch {
        toastMessage({
          title: "Error",
          description: "Invalid GeoJSN",
          icon: Cross,
        });
      }
    }

    toastMessage({
      title: "Layers added successfully",
      description: `${pending.length} layer${
        pending.length > 1 ? "s" : ""
      } added`,
      icon: BadgeCheck,
    });

    setPending([]);
    onOpenChange(false);
  };

  function handleTutorialStop() {
    setRunSteps(false);
  }
  // Handle step change in the tutorial
  function handleStepChange(newStepIndex: number) {
    setStepIndex(Math.max(0, Math.min(newStepIndex, UPLOADSTEPS.length - 1)));
  }

  return (
    <>
      <AlertDialog
        open={open}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setRunSteps(false); // close tutorial if dialog is closed
            resetForm();
            setStepIndex(0); // reset step index when dialog closes
          }
        }}
      >
        <AlertDialogOverlay className="z-[99] bg-black/10" />
        <AlertDialogContent
          id="upload-dialog"
          className="z-[100] bg-primary-light sm:rounded-2xl border-0"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Add a new layer</AlertDialogTitle>
            <AlertDialogDescription>
              Upload a GeoJSON file to add as a new layer
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="upload-files">
            <LayerUploadFiles
              selected={pending.map((p) => p.file)}
              onSelect={handleFilesSelect}
            />
          </div>
          <div className="layer-form">
            {pending.length === 1 ? (
              /* single file → reuse existing form */
              <LayerSettingsForm
                layerName={getUniqueLayerName(pending[0].name)}
                onNameChange={(name) => setPending([{ ...pending[0], name }])}
                fillColor={pending[0].color}
                onFillColorChange={(color) =>
                  setPending([{ ...pending[0], color }])
                }
                fillOpacity={pending[0].opacity}
                onFillOpacityChange={(opacity) =>
                  setPending([{ ...pending[0], opacity }])
                }
              />
            ) : pending.length > 1 ? (
              /* multiple files → stacked forms */
              <MultipleLayerSettingsForm
                layers={pending}
                onChange={(idx, patch) =>
                  setPending((all) =>
                    all.map((l, i) => (i === idx ? { ...l, ...patch } : l))
                  )
                }
              />
            ) : null}
          </div>

          <AlertDialogFooter>
            <div className="flex flex-row w-full">
              <div className="flex-1">
                <Button
                  onClick={() => setRunSteps(true)}
                  variant="secondary"
                  size="icon"
                >
                  <BookText
                    style={{
                      width: "1.8rem",
                      height: "1.8rem",
                      fill: "#ff8847",
                    }}
                  />
                </Button>
              </div>
              <div className="flex-3 gap-3 flex ">
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={pending.length === 0}
                  onClick={handleAddLayers}
                  className="rounded-xl layer-upload-btn"
                >
                  Add{" "}
                  {pending.length > 1 ? `${pending.length} layers` : "layer"}
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Render Joyride outside dialog using portal */}
      <FeatureJoyride
        steps={UPLOADSTEPS}
        run={runSteps && open}
        onStop={handleTutorialStop}
        disableOverlay={false}
        stepIndex={stepIndex} // ← add
        onStepChange={handleStepChange} // ← add
      />
    </>
  );
}
