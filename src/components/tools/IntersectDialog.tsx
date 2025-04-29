import { useState } from "react"
import { ToolDialogShell } from "./ToolDialogShell"
import * as turf from "@turf/turf"
import { useLayers } from "@/hooks/useLayers"
import { FeatureCollection, Polygon, MultiPolygon, Feature } from "geojson"
import { Layer } from "@/hooks/useLayers"
import { v4 as uuidv4 } from 'uuid'
import IntersectTool from "./IntersectTool"

interface IntersectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function bboxesOverlap(a: Feature<Polygon|MultiPolygon>, b: Feature<Polygon|MultiPolygon>) {
  // Compute bounding boxes for each polygon
  const boxA = turf.bbox(a); // [minX, minY, maxX, maxY]
  const boxB = turf.bbox(b);
  
  // If bounding boxes do not overlap, skip the expensive intersection
  // quick check:
  if (boxA[0] > boxB[2] || boxB[0] > boxA[2]) return false; // X ranges don't overlap
  if (boxA[1] > boxB[3] || boxB[1] > boxA[3]) return false; // Y ranges don't overlap
  return true;
}

export function IntersectDialog({ open, onOpenChange }: IntersectDialogProps) {
  // The parent owns all state:
  const [selectedFirstLayerId, setSelectedFirstLayerId] = useState("")
  const [selectedSecondLayerId, setSelectedSecondLayerId] = useState("")
  const [layerName, setLayerName] = useState("")
  const { layers, addLayer } = useLayers()
  

  // This is the "save" logic
  function onSave() {
    // Because the parent has all the form data, we can validate here
    if (!selectedFirstLayerId || !selectedSecondLayerId) {
      alert("Please fill all fields!")
      return
    }
    onOpenChange(false)
    setSelectedFirstLayerId("")
    setSelectedSecondLayerId("")
    setLayerName("")
    handleIntersection(selectedFirstLayerId, selectedSecondLayerId, layerName)
  }

  function handleIntersection(selectedFirstLayerId: string, selectedSecondLayerId: string, layerName: string) {
    const selectedFirstLayer = layers.find((layer) => layer.id === selectedFirstLayerId)
    const selectedSecondLayer = layers.find((layer) => layer.id === selectedSecondLayerId)
    if (!selectedFirstLayer || !selectedSecondLayer) {
      return
    }

    // Pairwise intersection
    const firstFeatures = selectedFirstLayer.data.features.filter((feature) => {
      return feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
    }
    ) as Feature<Polygon | MultiPolygon>[]
    const secondFeatures = selectedSecondLayer.data.features.filter((feature) => {
      return feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
    }
    ) as Feature<Polygon | MultiPolygon>[]
    const newFeatures = firstFeatures.flatMap((firstFeature) => {
      return secondFeatures.map((secondFeature) => {

        // Skip if bounding boxes do not overlap
        if (!bboxesOverlap(firstFeature, secondFeature)) return null;

        const twoFeatures: FeatureCollection<Polygon | MultiPolygon> = {
          type: 'FeatureCollection',
          features: [firstFeature, secondFeature],
        };
        const intersection = turf.intersect(twoFeatures);
        return intersection || null;
      });
    }).filter(Boolean) as Feature<Polygon | MultiPolygon>[];

    console.log('newFeatures:', newFeatures);

    try{
      const newLayer: Layer = {
        id: uuidv4(),
        name: layerName,
        data: {
          type: 'FeatureCollection',
          features: newFeatures,
        },
        fillColor: "#FF0000",
        fillOpacity: 0.5,
        visible: true,
        geometryType: 'Polygon',
      }
      addLayer(newLayer, "#FF0000", 0.5)
    } catch (error) {
      console.error('Error creating new layer:', error)
      alert('Error creating new layer')
}
  }

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Buffer"
      onSave={onSave}
    >
      <IntersectTool
        selectedFirstLayerId={selectedFirstLayerId}
        selectedSecondLayerId={selectedSecondLayerId}
        setSelectedFirstLayerId={setSelectedFirstLayerId}
        setSelectedSecondLayerId={setSelectedSecondLayerId}
        layerName={layerName}
        setLayerName={setLayerName}
      />
    </ToolDialogShell>
  )
}
