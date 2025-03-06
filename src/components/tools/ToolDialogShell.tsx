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
  }
  
  export function ToolDialogShell({
    open,
    onOpenChange,
    title,
    onSave,
    children,
  }: ToolDialogShellProps) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>This is the {title} tool dialog.</AlertDialogDescription>
          </AlertDialogHeader>
          {children}
          <AlertDialogFooter>
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
  