import { BookText } from "lucide-react"
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
import { Button } from "../ui/button"
import { NiceTooltip } from "./NiceToolTip"

interface FeatureExtractionDialogShellProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onSave?: () => void
    children: React.ReactNode
    description?: string,
    runSteps: boolean,
    setRunSteps: (run: boolean) => void
}

export function FeatureExtractionDialogShell({
    open,
    onOpenChange,
    title,
    onSave,
    children,
    description,
    runSteps,
    setRunSteps
}: FeatureExtractionDialogShellProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[1000px] w-[70vw] max-h-[90vh] overflow-hidden feature-extraction">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="overflow-hidden">
                    {children}
                </div>
                <AlertDialogFooter>
                    <div className="flex flex-row w-full">
                        <div className="flex-1">

                                <Button onClick={() => setRunSteps(true)} variant="secondary" size="icon">
                                    <BookText style={{ width: "1.8rem", height: "1.8rem", fill: '#ff8847' }} />
                                </Button>

                        </div>
                        <div className="flex-3 gap-3 flex">
                            <AlertDialogCancel onClick={() => onOpenChange(false)} className="rounded-xl">
                                Close
                            </AlertDialogCancel>
                            {onSave && (
                                <AlertDialogAction onClick={onSave} className="rounded-xl save-btn">
                                    Save
                                </AlertDialogAction>
                            )}
                        </div>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}