import { useState } from "react"
import { ToolDialogShell } from "./ToolDialogShell"
import DissolveTool from "./DissolveTool"
//import * as turf from "@turf/turf"
import { useLayers } from "@/hooks/useLayers"
import { v4 as uuidv4 } from "uuid"
import type { Feature, Polygon, MultiPolygon } from "geojson"
import { dissolve, flatten, polygon } from "@turf/turf"

interface DissolveDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export default function DissolveDialog({ open, onOpenChange }: DissolveDialogProps) {
  const { layers, addLayer } = useLayers()

  // form state
  const [selectedLayerId, setSelectedLayerId] = useState("")
  const [dissolveField, setDissolveField] = useState<string | null>(null)
  const [layerName, setLayerName] = useState("dissolved-layer")

  function onSave() {
    if (!selectedLayerId) {
      alert("Please choose a layer")
      return
    }
    handleDissolve(selectedLayerId, dissolveField)
    onOpenChange(false)
    setSelectedLayerId("")
    setDissolveField(null)
    setLayerName("dissolved-layer")
  }

  function handleDissolve(layerId: string, field: string | null) {
    const src = layers.find((l) => l.id === layerId)
    if (!src) return

    /** Step 1 – group features by dissolve field (or single group) */
    const groups: Record<string, Feature<Polygon | MultiPolygon>[]> = {}
    src.data.features.forEach((f) => {
      if (
        f.geometry.type !== "Polygon" &&
        f.geometry.type !== "MultiPolygon"
      )
        return
      const key = field ? (f.properties?.[field] ?? "__null__") : "all"
      groups[key] ||= []
      groups[key].push(f as Feature<Polygon | MultiPolygon>)
    })

    /** Step 2 – union every group */
    /** Step 2 – dissolve every group safely */
    const dissolvedFeatures = Object.entries(groups).map(([key, feats]) => {
        // 1) Flatten every (Multi)Polygon into *simple* polygons
        const flatPolys = feats.flatMap(f =>
        flatten(f).features as Feature<Polygon>[]
        )
    
        let geom: Feature<Polygon | MultiPolygon>
    
        if (flatPolys.length === 0) {
        // should not happen – but return an empty dummy instead of crashing
        geom = polygon([]) as Feature<Polygon>
        } else if (flatPolys.length === 1) {
        geom = flatPolys[0]                     // nothing to merge
        } else {
        // 2) dissolve never throws on a valid FeatureCollection of ≥2 polygons
        const fc = { type: "FeatureCollection" as const, features: flatPolys }
        geom = dissolve(fc).features[0] as Feature<Polygon | MultiPolygon>
        }
    
        geom.properties = field ? { [field]: key } : {}
        return geom
    })
  
      

    /** Step 3 – add result to the map */
    const newLayer = {
      id: uuidv4(),
      name: layerName,
      data: {
        type: "FeatureCollection" as const,
        features: dissolvedFeatures,
      },
      fillColor: "#884400",
      fillOpacity: 0.6,
      visible: true,
      geometryType: "Polygon" as const,
    }
    addLayer(newLayer, "#884400", 0.6)
  }

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Dissolve"
      onSave={onSave}
      description={
        dissolveField
          ? `Merges polygons that share the same value in "${dissolveField}".`
          : "Merges all polygons of the selected layer into one multipart feature."
      }
    >
      <DissolveTool
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        dissolveField={dissolveField}
        setDissolveField={setDissolveField}
        layerName={layerName}
        setLayerName={setLayerName}
      />
    </ToolDialogShell>
  )
}
