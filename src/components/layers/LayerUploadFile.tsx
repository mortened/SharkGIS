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
// import { Input } from "@/components/ui/input"
// import { Slider } from "@/components/ui/slider"

interface LayerUploadFileProps {
    selectedFile: File | null
    onFileSelect: (file: File) => void
    // layerName: string
    // onNameChange: (name: string) => void
    // fillColor: string
    // onFillColorChange: (color: string) => void
    // fillOpacity: number
    // onFillOpacityChange: (opacity: number) => void
}

export function LayerUploadFile({ 
    selectedFile, 
    onFileSelect, 
    // layerName, 
    // onNameChange,
    // fillColor,
    // onFillColorChange,
    // fillOpacity,
    // onFillOpacityChange
}: LayerUploadFileProps) {
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
            setErrorMessage("Please upload a GeoJSON file")
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === "application/json" || file.name.endsWith('.geojson')) {
                onFileSelect(file)
                setErrorMessage(null)
            } else {
                setErrorMessage("Please upload a GeoJSON file")
            }
        }
    }

    return (
        <Card 
            className={`border-2 border-secondary border-dashed transition-colors duration-200 ${
                dragActive ? "bg-secondary border-[#ffffff]" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <CardHeader>
                <CardTitle>File Upload</CardTitle>
                <CardDescription>
                    Drag and drop your GeoJSON file or click to browse
                </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[100px] flex flex-col items-center justify-center gap-4">
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
                    className="flex items-center gap-2 bg-secondary rounded-xl"
                >
                    <Upload className="h-4 w-4" />
                    Choose File
                </Button>
                {selectedFile && (
                    <p className="text-sm text-gray-600">
                        Selected: {selectedFile.name}
                    </p>
                )}
                {errorMessage && (
                    <p className="mt-1 text-red-500 text-sm">{errorMessage}</p>
                )}
        
        {/* <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col">
                <label
                    htmlFor="layerName"
                    className="mb-1 text-sm font-medium text-gray-700"
                    >
                    Layer Name
            </label>
            <Input
                id="layerName"
                type="text"
                placeholder="Enter layer name"
                value={layerName}
                onChange={(e) => onNameChange(e.target.value)}
                className="hover:border-gray-300"
            />
            {errorMessage && (
                <p className="mt-1 text-red-500 text-sm">{errorMessage}</p>
            )}
            </div>
            


            <div className="flex flex-col">
            <label
                htmlFor="fillColor"
                className="mb-1 text-sm font-medium text-gray-700"
            >
            Fill Color
            </label>
            <div className="flex items-center gap-2">
            <Input
                type="text"
                value={fillColor}
                onChange={(e) => onFillColorChange(e.target.value)}
                className="max-w-[6rem] hover:border-gray-300"
            />
            <input
                id="fillColor"
                type="color"
                value={fillColor}
                onChange={(e) => onFillColorChange(e.target.value)}
                className="h-8 w-8 rounded border cursor-pointer border-gray-300 hover:scale-110 transition-all duration-200"
            />
            </div>
        </div>

        </div>
        <div className="flex w-full flex-col">
            <label
                htmlFor="fillOpacity"
                className="mb-1 text-sm font-medium text-gray-700"  
            >
                Opacity: {fillOpacity * 100}%
            </label>
            <Slider
                value={[fillOpacity * 100]}
                onValueChange={(value) => onFillOpacityChange(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
            />
        </div> */}
            </CardContent>
        </Card>
    )
} 