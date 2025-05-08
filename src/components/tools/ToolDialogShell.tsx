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
  } from "../ui/alert-dialog"
  
  interface ToolDialogShellProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onSave?: () => void
    children: React.ReactNode
    description?: string
    className?: string
  }
  
  export function ToolDialogShell({
    open,
    onOpenChange,
    title,
    onSave,
    children,
    description,
    className,
  }: ToolDialogShellProps) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-h-[90vh] flex flex-col">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-sm">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
          <AlertDialogFooter className="pt-2 mt-2 border-t">
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              Close
            </AlertDialogCancel>
            {onSave && (
              <AlertDialogAction onClick={onSave}>
                Save
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  