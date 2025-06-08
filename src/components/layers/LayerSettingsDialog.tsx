import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { LayerSettingsForm } from "./LayerSettingsForm";
import { Layer, useLayers } from "@/hooks/useLayers";
import { toastMessage } from "../ToastMessage";
import { RefreshCcw } from "lucide-react";

interface LayerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layer?: Layer;
}

export function LayerSettingsDialog({
  open,
  onOpenChange,
  layer,
}: LayerSettingsDialogProps) {
  if (!layer) {
    return null;
  }

  const [layerName, setLayerName] = useState(layer.name);
  const [fillColor, setFillColor] = useState(layer.fillColor);
  const [fillOpacity, setFillOpacity] = useState(layer.fillOpacity);
  const { updateLayer } = useLayers();

  return (
    <>
      <div className="z-[100] absolute top-0 right-0 display-none"></div>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="z-[100] bg-[#a5c7db] sm:rounded-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <LayerSettingsForm
            layerName={layerName}
            onNameChange={setLayerName}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
            fillOpacity={fillOpacity}
            onFillOpacityChange={setFillOpacity}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={async () => {
                updateLayer(layer.id, {
                  ...layer,
                  name: layerName,
                  fillColor: fillColor,
                  fillOpacity: fillOpacity,
                  geometryType: layer.geometryType,
                });
                onOpenChange(false);
                toastMessage({
                  title: "Layer updated",
                  description: "Layer updated successfully",
                  icon: RefreshCcw,
                });
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
