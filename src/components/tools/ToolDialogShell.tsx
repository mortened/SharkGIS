// ToolDialogShell.tsx
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

interface ToolDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSave?: () => void;
  children: React.ReactNode;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
  saveButtonClassName?: string; // Add this prop
}

export function ToolDialogShell({
  open,
  onOpenChange,
  title,
  onSave,
  children,
  description,
  className,
  actions,
  saveButtonClassName,
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
