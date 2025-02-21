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
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { LayerUploadForm } from "./LayerUploadForm"
import { useLayers } from "@/hooks/useLayers"
import { v4 as uuidv4 } from 'uuid'

interface LayerUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LayerUploadDialog({ open, onOpenChange }: LayerUploadDialogProps) {
    const [layerName, setLayerName] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const { addLayer } = useLayers()

    const handleAddLayer = async () => {
        if (selectedFile && layerName) {
            try {
                const fileContents = await selectedFile.text()
                const geoJsonData = JSON.parse(fileContents)
                
                await addLayer({
                    data: geoJsonData,
                    name: layerName,
                    id: uuidv4(),
                    visible: true
                })
                
                onOpenChange(false)
                setLayerName("")
                setSelectedFile(null)
            } catch (error) {
                console.error('Error reading file:', error)
                alert('Error reading file. Please make sure it is valid GeoJSON.')
            }
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogOverlay className="z-[99] bg-black/10" />
            <AlertDialogContent className="z-[100] bg-[#a5c7db] sm:rounded-2xl border-0">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New Layer</AlertDialogTitle>
                    <AlertDialogDescription>
                        Upload a GeoJSON file to add as a new layer
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <LayerUploadForm
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    layerName={layerName}
                    onNameChange={setLayerName}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        disabled={!selectedFile || !layerName}
                        onClick={handleAddLayer}
                        className="rounded-xl"
                    >
                        Add Layer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
