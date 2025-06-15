// ToolDialogShell.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
// custom reusable dialog shell for tools
// This shell is used for various tools like Buffer, Intersect, Union, etc.
interface ToolDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSave?: () => void;
  children: React.ReactNode;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
  saveButtonClassName?: string;
  keepInputLayer?: boolean;
  onKeepInputLayerChange?: (checked: boolean) => void;
  showKeepInputLayerToggle?: boolean; // controls visibility of the toggle
}

export function ToolDialogShell({
  open,
  onOpenChange,
  title,
  onSave,
  children,
  description,
  actions,
  saveButtonClassName,
  keepInputLayer = true,
  onKeepInputLayerChange,
  showKeepInputLayerToggle = true,
}: ToolDialogShellProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] flex flex-col clip-tool">
        <AlertDialogHeader className="pb-2">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
        {showKeepInputLayerToggle && onKeepInputLayerChange && (
          <div className="flex items-center space-x-2 mt-4 px-6 pb-2 remove-input-layer">
            <Checkbox
              id="keep-input-layer"
              checked={keepInputLayer}
              onCheckedChange={(checked) =>
                onKeepInputLayerChange(checked === true)
              }
            />
            <label
              htmlFor="keep-input-layer"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Keep input layer(s) after processing
            </label>
          </div>
        )}

        <AlertDialogFooter className="pt-2 mt-2 border-t">
          <div className="flex flex-row w-full">
            {/* actions slot for book */}
            {actions && <div className="flex-1">{actions}</div>}
            <div className="flex-3 gap-3 flex">
              <AlertDialogCancel onClick={() => onOpenChange(false)}>
                Close
              </AlertDialogCancel>
              {onSave && (
                <Button
                  variant="default"
                  onClick={onSave}
                  className={`clip-btn ${saveButtonClassName || ""}`}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
