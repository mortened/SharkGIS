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

interface FeatureExtractionDialogShellProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onSave?: () => void
    children: React.ReactNode
    description?: string
}

export function FeatureExtractionDialogShell({
    open,
    onOpenChange,
    title,
    onSave,
    children,
    description,
}: FeatureExtractionDialogShellProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[1000px] w-[70vw] max-h-[90vh] overflow-hidden">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="overflow-hidden">
                    {children}
                </div>
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