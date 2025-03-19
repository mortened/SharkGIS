import { use, useState } from "react"
import { getPublicPath } from "@/lib/utils"
import { Sidebar } from "./ui/sidebar"
import { Button } from "./ui/button"
import { LayerUploadDialog } from "./layers/LayerUploadDialog"
import { Check, Plus } from "lucide-react"
import { useDrawStore } from "@/hooks/useDrawStore"
import { useSidebar } from "./ui/sidebar"
import { X, RotateCcw } from "lucide-react"
import { FeatureCollection } from "geojson"
import { useLayers } from "@/hooks/useLayers"


export default function TopBar() {
  // Track which tool is open and whether the dialog is visible
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [closeSidebar, setCloseSidebar] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [activeGeometry, setActiveGeometry] = useState<string | null>(null)
  const draw = useDrawStore(state => state.draw) 
  const setDraw = useDrawStore(state => state.setDraw)
  const {setOpen} = useSidebar()
  const {addLayer, layers} = useLayers()
  
  function drawLayer(geometry: string): void {
        if (!draw) return
        setActiveGeometry(geometry)
        setIsDisabled(true)

        switch (geometry) {
            case "point":
                draw.changeMode("draw_point")
                break
            case "line":
                draw.changeMode("draw_line_string")
                break
            case "polygon":
                draw.changeMode("draw_polygon")
                break
        }

        setOpen(false)

    }

    

    function saveLayer(draw: FeatureCollection | null): void {
        if (!draw) return
        console.log(draw)

        //Add layer to the store
        addLayer({
            id: `layer-${layers.length + 1}`,
            name: `Layer ${layers.length + 1}`,
            data: draw,
            fillColor: "#ff0000",
            fillOpacity: 0.5,
            visible: true,
            geometryType: activeGeometry as any,
        }, "#ff0000", 0.5)

    }

  return (
    <>
    <Sidebar side="top" className="bg-white/90">
        
        
        <div className="flex flex-row justify-center">

            <Button variant="ghost" size="lg" onClick={() => setIsDialogOpen(true)} className="flex flex-row items-center" disabled={isDisabled}>
                <Plus className="h-8 w-8" />
                <span className="text-xs">Upload</span>

            </Button>
            <LayerUploadDialog 
                            open={isDialogOpen} 
                            onOpenChange={setIsDialogOpen}
                        />
            
                <Button variant="ghost" size="sm" className=" h-100" onClick={() => drawLayer("point")} disabled={isDisabled}>
                <img src={getPublicPath(`/icons/point.svg`)} className="h-6 w-6"/>
                </Button>
                <Button variant="ghost" size="sm" className=" h-100" onClick={() => drawLayer("line")} disabled={isDisabled}>
                <img src={getPublicPath(`/icons/line.svg`)} className="h-6 w-6"/> 
                </Button>
                <Button variant="ghost" size="sm" className=" h-100" onClick={() => drawLayer("polygon")} disabled={isDisabled}>
                <img src={getPublicPath(`/icons/polygon.svg`)} className="h-6 w-6"/>
                </Button>

            </div>
    </Sidebar>

    {isDisabled && (
        <Sidebar side="bottom" className="bg-white/90">
            <div className="flex flex-row justify-center">
                <Button variant="ghost" size="sm" onClick={() => setIsDisabled(false)}>
                    <X className="h-8 w-8" />
                    <span className="text-xs">Cancel</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                    if (!draw) return
                    draw.deleteAll()
                    drawLayer(activeGeometry!)
                }}>
                    <RotateCcw className="h-8 w-8" />
                    <span className="text-xs">Clear all</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                    drawLayer(activeGeometry!)
                }
                }>
                    <Plus className="h-8 w-8" />
                    <span className="text-xs">Add another</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                    setIsDisabled(false)
                    saveLayer(draw?.getAll())
                    draw?.deleteAll()
                }}>
                    <Check className="h-8 w-8" />
                    <span className="text-xs">Finish</span>
                </Button>
            </div>
        </Sidebar>
    )}

    </>

  )
}
