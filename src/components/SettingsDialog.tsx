"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import StyleSwitcher from "./StyleSwitcher";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  onSave,
}: SettingsDialogProps) {
  const handleSave = () => {
    onSave?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Increased max width to make the dialog wider */}
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Map settings</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the style of the map.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Controls */}
        <div className="py-2">
          <StyleSwitcher />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" className="w-full sm:w-auto">
              Close
            </Button>
          </AlertDialogCancel>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
