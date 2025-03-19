import { useState } from "react"
import { ToolDialogShell } from "./ToolDialogShell"
import BufferTool from "./BufferTool"
import * as turf from "@turf/turf"
import { useLayers } from "@/hooks/useLayers"
import { Layer } from "@/hooks/useLayers"
import { v4 as uuidv4 } from 'uuid'

interface BufferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BufferDialog({ open, onOpenChange }: BufferDialogProps) {
  // The parent owns all state:
  const [selectedLayerId, setSelectedLayerId] = useState("")
  const [bufferDistance, setBufferDistance] = useState<number | null>(null)
  const [layerName, setLayerName] = useState("")
  const { layers, addLayer } = useLayers()

  // This is the "save" logic
  function onSave() {
    // Because the parent has all the form data, we can validate here
    if (!selectedLayerId || !bufferDistance) {
      alert("Please fill all fields!")
      return
    }
    // Otherwise, do the geoprocessing, or pass data to your store, etc.
    console.log("Saving with:", { selectedLayerId, bufferDistance, layerName })
    onOpenChange(false)
    setSelectedLayerId("")
    setBufferDistance(null)
    setLayerName("")
    handleBuffer(selectedLayerId, bufferDistance, layerName)
  }

  function handleBuffer(selectedLayerId: string, bufferDistance: number, layerName: string) {
    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId)
    if (!selectedLayer) {
      return
    }
    const buffered = turf.buffer(selectedLayer.data, bufferDistance, { units: "meters" })
    const geoJsonData = buffered
    const fillColor = "#008888"
    const fillOpacity = 0.8
    if (!geoJsonData) {
      console.error("Buffering failed, geoJsonData is undefined")
      return
    }
    const geometryType = turf.getType(geoJsonData) as 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon'
    
    try{
        addLayer({
        data: geoJsonData,
        name: layerName,
        id: uuidv4(),
        visible: true,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        geometryType: geometryType
    }, fillColor, fillOpacity)

    }catch(error){
        console.error('Error adding layer:', error)
    }
}

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Buffer"
      onSave={onSave}
      description="Creates a new polygon(s) around a feature at a specified distance, essentially drawing a boundary line a set distance away from that feature."
    >
      <BufferTool
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        bufferDistance={bufferDistance}
        setBufferDistance={setBufferDistance}
        layerName={layerName}
        setLayerName={setLayerName}
      />
    </ToolDialogShell>
  )
}