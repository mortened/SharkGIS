import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogOverlay,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState, useRef } from "react"

export default function NewLayerButton() {
    const [layerName, setLayerName] = useState("")
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        const file = e.dataTransfer.files[0]
        if (file && (file.type === "application/json" || file.name.endsWith('.geojson'))) {
            setSelectedFile(file)
        } else {
            alert("Please upload a JSON or GeoJSON file")
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === "application/json" || file.name.endsWith('.geojson')) {
                setSelectedFile(file)
            } else {
                alert("Please upload a JSON or GeoJSON file")
            }
        }
    }

    function handleAddLayer(_event: React.MouseEvent<HTMLButtonElement>): void {
        console.log("Adding layer")
        console.log(selectedFile)
        console.log(layerName)
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="outline"
                    size="icon"
                    className="fixed bottom-6 right-6 z-40 rounded-full w-20 h-20 shadow-lg hover:shadow-xl transition-shadow bg-[#a5c7db]"
                >
                    <Plus className="h-10 w-10" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogOverlay className="z-[99] bg-black/10" />
            <AlertDialogContent className="z-[100] bg-[#0A9396] sm:rounded-2xl border-0">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New Layer</AlertDialogTitle>
                    <AlertDialogDescription>
                        Upload a GeoJSON/JSON file to add as a new layer
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Card 
                    className={`border-2 border-dashed transition-colors duration-200 ${
                        dragActive ? "bg-[#ff8847]" : "bg-[#e6f4f1]"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <CardHeader>
                        <CardTitle>Layer Details</CardTitle>
                        <CardDescription>Drag and drop your GeoJSON/JSON file or click to browse</CardDescription>
                    </CardHeader>
                    <CardContent
                        className="min-h-[150px] flex flex-col items-center justify-center gap-4"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,.geojson"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <Button 
                            variant="ghost" 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-[#ff8847] rounded-xl"
                        >
                            <Upload className="h-4 w-4" />
                            Choose File
                        </Button>
                        {selectedFile && (
                            <p className="text-sm text-gray-600">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Input
                            type="text"
                            placeholder="Layer Name"
                            className="mt-2 rounded-xl bg-[#e6f4f1]"
                            value={layerName}
                            onChange={(e) => setLayerName(e.target.value)}
                        />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        disabled={!selectedFile || !layerName}
                        onClick={handleAddLayer}
                        className="bg-[#ff8847] opacity-80"
                    >
                        Add Layer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}