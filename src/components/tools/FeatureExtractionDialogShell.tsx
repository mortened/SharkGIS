import { BookText } from "lucide-react";
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
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

// custom shell for feature extraction dialog

interface FeatureExtractionDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSave?: () => void;
  children: React.ReactNode;
  description?: string;
  runSteps: boolean;
  setRunSteps: (run: boolean) => void;
  keepInputLayer?: boolean;
  onKeepInputLayerChange?: (keep: boolean) => void;
  showKeepInputLayerToggle?: boolean;
}

export function FeatureExtractionDialogShell({
  open,
  onOpenChange,
  title,
  onSave,
  children,
  description,
  setRunSteps,
  keepInputLayer = true,
  onKeepInputLayerChange,
  showKeepInputLayerToggle = false,
}: FeatureExtractionDialogShellProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[1000px] w-[70vw] max-h-[90vh] overflow-hidden feature-extraction">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="overflow-hidden">{children}</div>
        <AlertDialogFooter>
          <div className="flex flex-row w-full">
            <div className="flex-1 flex items-center gap-4">
              <Button
                onClick={() => setRunSteps(true)}
                variant="secondary"
                size="icon"
              >
                <BookText
                  style={{ width: "1.8rem", height: "1.8rem", fill: "#ff8847" }}
                />
              </Button>
            </div>
            {/* Keep Input Layer Toggle */}
            {showKeepInputLayerToggle && onKeepInputLayerChange && (
              <div className="flex flex-1 space-x-2 items-center remove-input-feature-extract-layer">
                <Checkbox
                  id="keep-input-layer"
                  checked={keepInputLayer}
                  onCheckedChange={onKeepInputLayerChange}
                />
                <label
                  htmlFor="keep-input-layer"
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:opacity-70"
                >
                  Keep original layer
                </label>
              </div>
            )}

            <div className="flex-3 gap-3 flex">
              <AlertDialogCancel
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Close
              </AlertDialogCancel>
              {onSave && (
                <AlertDialogAction
                  onClick={onSave}
                  className="rounded-xl save-btn"
                >
                  Save
                </AlertDialogAction>
              )}
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
