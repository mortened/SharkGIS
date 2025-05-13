import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

interface LayerSettingsFormProps {
    layerName: string
    onNameChange: (name: string) => void
    fillColor: string
    onFillColorChange: (color: string) => void
    fillOpacity: number
    onFillOpacityChange: (opacity: number) => void
}

export function LayerSettingsForm({ 
    layerName, 
    onNameChange, 
    fillColor, 
    onFillColorChange, 
    fillOpacity, 
    onFillOpacityChange 
}: LayerSettingsFormProps) {
    
    return (
        <Card
        className={""}
        >
            <CardHeader>
                <CardTitle>Layer Settings</CardTitle>
                    {/* <CardDescription>
                        Configure the layer settings
                    </CardDescription> */}
            </CardHeader>
                <CardContent>
                <div className="flex flex-row w-full justify-between">
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
                <div className="flex w-full flex-col pt-5 pb-5">
                    <label
                        htmlFor="fillOpacity"
                        className="mb-1 text-sm font-medium text-gray-700"  
                    >
                        Opacity: {Math.floor(fillOpacity * 100)}%
                    </label>
                    <Slider
                        value={[fillOpacity * 100]}
                        onValueChange={(value) => onFillOpacityChange(value[0] / 100)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                </div>
                </CardContent>
        </Card>
    )
}
