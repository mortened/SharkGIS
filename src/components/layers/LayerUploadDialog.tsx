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
import { useEffect, useState } from "react"
import { LayerUploadFile } from "./LayerUploadFile"
import { useLayers } from "@/hooks/useLayers"
import { v4 as uuidv4 } from 'uuid'
import { LayerSettingsForm } from "./LayerSettingsForm"
import { toast, Toaster } from "sonner"
import { BadgeCheck } from "lucide-react"
import { getUniqueLayerName, getUniqueColor } from "@/lib/utils"
interface LayerUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}


export function LayerUploadDialog({ open, onOpenChange }: LayerUploadDialogProps) {
    const [layerName, setLayerName] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fillColor, setFillColor] = useState(getUniqueColor())
    const [fillOpacity, setFillOpacity] = useState(0.8)
    const { addLayer } = useLayers()

    // Set name of the layer based on the file name if file is selected
    useEffect(() => {
        if (selectedFile) {
            const name = selectedFile.name.split('.').slice(0, -1).join('.')
            // Check if name is unique
            const uniqueName = getUniqueLayerName(name)
            setLayerName(uniqueName)
        }
    }, [selectedFile])
        

    function displayToast(title: string, description: string) {
        toast(title, {
            description: description,
            duration: 2000,
            position: "top-center",
            icon: <BadgeCheck className="h-4 w-4" />,
            style: {
                background: "#a5c7db",
                color: "#000",
            },
        })
    }

    const handleAddLayer = async () => {
        if (selectedFile && layerName) {
            try {
                const fileContents = await selectedFile.text()
                const geoJsonData = JSON.parse(fileContents)
                
                addLayer({
                    data: geoJsonData,
                    name: getUniqueLayerName(layerName),
                    id: uuidv4(),
                    visible: true,
                    fillColor: fillColor,
                    fillOpacity: fillOpacity,
                    geometryType: geoJsonData.features[0].geometry.type as 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'
                }, fillColor, fillOpacity)
                
                onOpenChange(false)
                setLayerName("")
                setSelectedFile(null)
                setFillColor(getUniqueColor())
                setFillOpacity(0.8)
                displayToast('Layer added successfully', 'The layer has been added to the map.')
            } catch (error) {
                console.error('Error reading file:', error)
                toast.error('Error reading file. Please make sure it is valid GeoJSON.')
            }
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogOverlay className="z-[99] bg-black/10" />
            <AlertDialogContent className="z-[100] bg-primary-light sm:rounded-2xl border-0">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add a new layer</AlertDialogTitle>
                    <AlertDialogDescription>
                        Upload a GeoJSON file to add as a new layer
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <LayerUploadFile
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    // layerName={layerName}
                    // onNameChange={setLayerName}
                    // fillColor={fillColor}
                    // onFillColorChange={(color) => setFillColor(color)}
                    // fillOpacity={fillOpacity}
                    // onFillOpacityChange={(opacity) => setFillOpacity(opacity)}
                />
                <LayerSettingsForm
                    layerName={layerName}
                    onNameChange={setLayerName}
                    fillColor={fillColor}
                    onFillColorChange={(color) => setFillColor(color)}
                    fillOpacity={fillOpacity}
                    onFillOpacityChange={(opacity) => setFillOpacity(opacity)}
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
            <Toaster 
            />
        </AlertDialog>
    )
}
