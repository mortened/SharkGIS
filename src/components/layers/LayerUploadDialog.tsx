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
import { LayerUploadFiles } from "./LayerUploadFiles"
import { MultipleLayerSettingsForm, TempLayer } from "./MultipleLayerSettingsForm"
interface LayerUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}


export function LayerUploadDialog({ open, onOpenChange }: LayerUploadDialogProps) {
    const [layerName, setLayerName] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [fillColor, setFillColor] = useState(getUniqueColor())
    const [fillOpacity, setFillOpacity] = useState(0.8)
    const { addLayer } = useLayers()
    const [pending, setPending] = useState<TempLayer[]>([]);

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

    function resetForm() {
        setLayerName("")
        setSelectedFile(null)
        setFillColor(getUniqueColor())
        setFillOpacity(0.8)
        setPending([])
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

    /* ---------- when user selects files ---------- */
    const handleFilesSelect = (files: File[]) => {
        // colours already taken by *queued* layers
        const taken = new Set<string>();
      
        const newPending: TempLayer[] = files.map((file) => {
          const color = getUniqueColor([...taken]);
          taken.add(color);
      
          return {
            file,
            name: getUniqueLayerName(file.name.replace(/\.geojson$/i, "")),
            color,
            opacity: 0.8,
          };
        });
      
        setPending(newPending);
      };
      

    /* ---------- bulk‑add all layers ---------- */
    const handleAddLayers = async () => {
        for (const l of pending) {
        try {
            const json = JSON.parse(await l.file.text());

            addLayer(
            {
                data: json,
                id: uuidv4(),
                name: getUniqueLayerName(l.name),
                visible: true,
                fillColor: l.color,
                fillOpacity: l.opacity,
                geometryType: json.features[0].geometry
                .type as TempLayer["geometryType"],
            },
            l.color,
            l.opacity,
            );
        } catch {
            toast.error(`${l.file.name}: invalid GeoJSON`);
        }
        }

        toast("Layer(s) added", {
        description: `${pending.length} layer${pending.length > 1 ? "s" : ""} added`,
        icon: <BadgeCheck className="h-4 w-4" />,
        duration: 2000,
        position: "top-center",
        });

        setPending([]);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={
            (open) => {
                onOpenChange(open)
                if (!open) {
                    resetForm()
                }
            }
        }>
            <AlertDialogOverlay className="z-[99] bg-black/10" />
            <AlertDialogContent className="z-[100] bg-primary-light sm:rounded-2xl border-0">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add a new layer</AlertDialogTitle>
                    <AlertDialogDescription>
                        Upload a GeoJSON file to add as a new layer
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {/* <LayerUploadFile
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    // layerName={layerName}
                    // onNameChange={setLayerName}
                    // fillColor={fillColor}
                    // onFillColorChange={(color) => setFillColor(color)}
                    // fillOpacity={fillOpacity}
                    // onFillOpacityChange={(opacity) => setFillOpacity(opacity)}
                /> */}
                <LayerUploadFiles selected={pending.map((p) => p.file)} onSelect={handleFilesSelect} />

                {pending.length === 1 ? (
                /* single file → reuse existing form */
                <LayerSettingsForm
                    layerName={pending[0].name}
                    onNameChange={(name) => setPending([{ ...pending[0], name }])}
                    fillColor={pending[0].color}
                    onFillColorChange={(color) => setPending([{ ...pending[0], color }])}
                    fillOpacity={pending[0].opacity}
                    onFillOpacityChange={(opacity) => setPending([{ ...pending[0], opacity }])}
                />
                ) : pending.length > 1 ? (
                /* multiple files → stacked forms */
                <MultipleLayerSettingsForm
                    layers={pending}
                    onChange={(idx, patch) =>
                    setPending((all) =>
                        all.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
                    )
                    }
                />
                ) : null}
                
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        disabled={pending.length === 0}
                        onClick={handleAddLayers}
                        className="rounded-xl"
                    >
                        Add {pending.length > 1 ? `${pending.length} layers` : "layer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            <Toaster 
            />
        </AlertDialog>
    )
}
