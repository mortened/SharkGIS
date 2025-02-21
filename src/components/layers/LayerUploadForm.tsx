import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"

interface LayerUploadFormProps {
    selectedFile: File | null
    onFileSelect: (file: File) => void
    layerName: string
    onNameChange: (name: string) => void
}

export function LayerUploadForm({ 
    selectedFile, 
    onFileSelect, 
    layerName, 
    onNameChange 
}: LayerUploadFormProps) {
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
            onFileSelect(file)
            setErrorMessage(null)
        } else {
            setErrorMessage("Please upload a JSON or GeoJSON file")
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === "application/json" || file.name.endsWith('.geojson')) {
                onFileSelect(file)
                setErrorMessage(null)
            } else {
                setErrorMessage("Please upload a JSON or GeoJSON file")
            }
        }
    }

    return (
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
                <CardDescription>
                    Drag and drop your GeoJSON/JSON file or click to browse
                </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[150px] flex flex-col items-center justify-center gap-4">
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
                <Input
                    type="text"
                    placeholder="Layer Name"
                    value={layerName}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="mt-2"
                />
                {errorMessage && (
                    <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
            </CardContent>
        </Card>
    )
} 