import { useState } from "react"
import { ToolDialogShell } from "./ToolDialogShell"
import BufferTool from "./BufferTool"
import * as turf from "@turf/turf"
import { useLayers } from "@/hooks/useLayers"
import { v4 as uuidv4 } from 'uuid'
import { LayerSettingsForm } from "../layers/LayerSettingsForm"
import { getUniqueColor } from "@/lib/utils"

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
  const [fillColor, setFillColor] = useState(getUniqueColor())
  const [fillOpacity, setFillOpacity] = useState(1)
  const [errors, setErrors] = useState<{ layer: boolean; distance: boolean }>({
    layer: false,
    distance: false,
  });

  // This is the "save" logic
  function onSave() {
    // Because the parent has all the form data, we can validate here
    const hasLayer = !!selectedLayerId;
    const hasDistance = !!bufferDistance;

    if (!hasLayer || !hasDistance) {
      setErrors({
        layer: !hasLayer,
        distance: !hasDistance,
      });
      return;
    }
    // Otherwise, do the geoprocessing, or pass data to your store, etc.
    console.log("Saving with:", { selectedLayerId, bufferDistance, layerName })
    handleBuffer(selectedLayerId, bufferDistance, layerName)
    onOpenChange(false)
    setSelectedLayerId("")
    setBufferDistance(null)
    setLayerName("")
    setFillColor(getUniqueColor())
    setErrors({ layer: false, distance: false })
  }

  function handleBuffer(selectedLayerId: string, bufferDistance: number, layerName: string) {
    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId)
    if (!selectedLayer) {
      return
    }
    const buffered = turf.buffer(selectedLayer.data, bufferDistance, { units: "meters" })
    const geoJsonData = buffered
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
      onOpenChange={
        (open) => {
          onOpenChange(open)
          if (!open) {
            setSelectedLayerId("")
            setBufferDistance(null)
            setLayerName("")
            setErrors({ layer: false, distance: false })
          }
        }
      }
      title="Buffer"
      onSave={onSave}
      description="Creates a new polygon feature at a specified distance around the input layer's geometry."
    >
      <BufferTool
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        bufferDistance={bufferDistance}
        setBufferDistance={setBufferDistance}
        layerName={layerName}
        setLayerName={setLayerName}
        errors={errors}
      />
      <LayerSettingsForm
        layerName={layerName}
        onNameChange={setLayerName}
        fillColor={fillColor}
        fillOpacity={fillOpacity}
        onFillColorChange={setFillColor}
        onFillOpacityChange={setFillOpacity}
      />
    </ToolDialogShell>
  )
}