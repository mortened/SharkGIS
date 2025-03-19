import { useState } from "react"
import { ToolDialogShell } from "./ToolDialogShell"
import { Input } from "../ui/input"
import * as turf from "@turf/turf"
import { useLayers } from "@/hooks/useLayers"
import { FeatureCollection, Polygon, MultiPolygon, Feature } from "geojson"
import { v4 as uuidv4 } from 'uuid'
import { Button } from "../ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "../ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import { Card, CardContent } from "../ui/card"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { LayerSettingsForm } from "../layers/LayerSettingsForm" // or define locally if you prefer

// Generic bounding box overlap check
function bboxesOverlap(a: Feature<Polygon|MultiPolygon>, b: Feature<Polygon|MultiPolygon>) {
  const boxA = turf.bbox(a)
  const boxB = turf.bbox(b)
  if (boxA[0] > boxB[2] || boxB[0] > boxA[2]) return false
  if (boxA[1] > boxB[3] || boxB[1] > boxA[3]) return false
  return true
}

// Example pairwise union
function pairwiseUnion(featureA: Feature<Polygon|MultiPolygon>, featureB: Feature<Polygon|MultiPolygon>) {
  const twoFeatures = turf.featureCollection([featureA, featureB]) as FeatureCollection<Polygon|MultiPolygon>
  const merged = turf.union(twoFeatures)
  return merged
}

interface PolygonToolDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  operation: "Intersect" | "Union" | "Difference"
  description?: string
}

export default function PolygonToolDialog({
  open,
  onOpenChange,
  operation,
  description,
}: PolygonToolDialogProps) {
  const { layers, addLayer } = useLayers()

  // Layer states: name, fill color, and opacity. 
  // These will control what the user sees in LayerSettingsForm.
  const [layerName, setLayerName] = useState(operation.toLowerCase() + "-layer")
  const [fillColor, setFillColor] = useState("#FF0000")
  const [fillOpacity, setFillOpacity] = useState(0.5)

  // State for the two source layers
  const [selectedFirstLayerId, setSelectedFirstLayerId] = useState("")
  const [selectedSecondLayerId, setSelectedSecondLayerId] = useState("")

  const selectedFirstLayer = layers.find((ly) => ly.id === selectedFirstLayerId)
  const selectedSecondLayer = layers.find((ly) => ly.id === selectedSecondLayerId)

  const firstButtonLabel = selectedFirstLayer ? selectedFirstLayer.name : "Choose first layer"
  const secondButtonLabel = selectedSecondLayer ? selectedSecondLayer.name : "Choose second layer"

  // Popover states
  const [openFirst, setOpenFirst] = useState(false)
  const [openSecond, setOpenSecond] = useState(false)

  // Called when user clicks "Save"
  function onSave() {
    if (!selectedFirstLayerId || !selectedSecondLayerId) {
      alert("Please select both layers.")
      return
    }
    // close dialog
    onOpenChange(false)

    // store current user inputs, then reset
    const finalName = layerName
    const finalColor = fillColor
    const finalOpacity = fillOpacity

    setSelectedFirstLayerId("")
    setSelectedSecondLayerId("")
    setLayerName(operation.toLowerCase() + "-layer") 
    // You can also decide whether you want to reset color/opacity:
    // setFillColor("#FF0000")
    // setFillOpacity(0.5)

    // pick your operation
    if (operation === "Intersect") {
      doIntersect(finalName, finalColor, finalOpacity)
    } else if (operation === "Union") {
      doUnion(finalName, finalColor, finalOpacity)
    } else {
      // For difference or other operations, handle them similarly
      doDifference(finalName, finalColor, finalOpacity)
    }
  }

  function doDifference(tempName: string, color: string, opacity: number) {
    if (!selectedFirstLayer || !selectedSecondLayer) return

    const firstFeatures = selectedFirstLayer.data.features.filter((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    ) as Feature<Polygon|MultiPolygon>[]
    const secondFeatures = selectedSecondLayer.data.features.filter((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    ) as Feature<Polygon|MultiPolygon>[]
    const differenceResults: Feature<Polygon|MultiPolygon>[] = []

    for (const featureA of firstFeatures) {
      for (const featureB of secondFeatures) {
        if (!bboxesOverlap(featureA, featureB)) continue
        const fc = turf.featureCollection([featureA, featureB]) as FeatureCollection<Polygon|MultiPolygon>
        const difference = turf.difference(fc)
        if (difference) differenceResults.push(difference)
      }
    }

    if (!differenceResults.length) {
      console.warn("No difference found.")
    }

    addLayer(
      {
        id: uuidv4(),
        name: tempName,
        data: {
          type: "FeatureCollection",
          features: differenceResults,
        },
        fillColor: color,
        fillOpacity: opacity,
        visible: true,
        geometryType: "Polygon",
      },
      color,
      opacity
    )
  }



  // Pairwise intersect
  function doIntersect(tempName: string, color: string, opacity: number) {
    if (!selectedFirstLayer || !selectedSecondLayer) return

    const firstFeatures = selectedFirstLayer.data.features.filter((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    ) as Feature<Polygon|MultiPolygon>[]

    const secondFeatures = selectedSecondLayer.data.features.filter((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    ) as Feature<Polygon|MultiPolygon>[]

    const newFeatures: Feature<Polygon|MultiPolygon>[] = []
    for (const featureA of firstFeatures) {
      for (const featureB of secondFeatures) {
        if (!bboxesOverlap(featureA, featureB)) continue
        const fc = turf.featureCollection([featureA, featureB]) as FeatureCollection<Polygon|MultiPolygon>
        const intersection = turf.intersect(fc)
        if (intersection) newFeatures.push(intersection)
      }
    }

    if (!newFeatures.length) {
      console.warn("No overlapping area found.")
    }

    addLayer(
      {
        id: uuidv4(),
        name: tempName,
        data: {
          type: "FeatureCollection",
          features: newFeatures,
        },
        fillColor: color,
        fillOpacity: opacity,
        visible: true,
        geometryType: "Polygon",
      },
      color,
      opacity
    )
  }

  // Pairwise union
  function doUnion(tempName: string, color: string, opacity: number) {
    if (!selectedFirstLayer || !selectedSecondLayer) return

    const firstFeatures = selectedFirstLayer.data.features.filter((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    ) as Feature<Polygon|MultiPolygon>[]

    const secondFeatures = selectedSecondLayer.data.features.filter((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    ) as Feature<Polygon|MultiPolygon>[]

    const unionResults: Feature<Polygon|MultiPolygon>[] = []

    for (const featureA of firstFeatures) {
      for (const featureB of secondFeatures) {
        if (!bboxesOverlap(featureA, featureB)) continue
        const merged = pairwiseUnion(featureA, featureB)
        if (merged) unionResults.push(merged)
      }
    }

    addLayer(
      {
        id: uuidv4(),
        name: tempName,
        data: {
          type: "FeatureCollection",
          features: unionResults,
        },
        fillColor: color,
        fillOpacity: opacity,
        visible: true,
        geometryType: "Polygon",
      },
      color,
      opacity
    )
  }

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={operation}
      onSave={onSave}
      description={description}
    >
      <Card>
        <CardContent>
          {/* First layer popover */}
          <Popover open={openFirst} onOpenChange={setOpenFirst}>
            <PopoverTrigger asChild>
              <Button variant="default" role="combobox" className="w-[200px] justify-between">
                {firstButtonLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search layer..." />
                <CommandList>
                  <CommandEmpty>No layers found.</CommandEmpty>
                  <CommandGroup>
                    {layers.map((ly) => (
                      <CommandItem
                        key={ly.id}
                        value={ly.name}
                        onSelect={() => {
                          setSelectedFirstLayerId(ly.id)
                          setOpenFirst(false)
                          setLayerName(`${ly.name}-${operation.toLowerCase()}`)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            ly.id === selectedFirstLayerId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {ly.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Second layer popover */}
          <Popover open={openSecond} onOpenChange={setOpenSecond}>
            <PopoverTrigger asChild>
              <Button variant="default" role="combobox" className="w-[200px] justify-between">
                {secondButtonLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search layer..." />
                <CommandList>
                  <CommandEmpty>No layers found.</CommandEmpty>
                  <CommandGroup>
                    {layers.map((ly) => (
                      <CommandItem
                        key={ly.id}
                        value={ly.name}
                        onSelect={() => {
                          setSelectedSecondLayerId(ly.id)
                          setOpenSecond(false)
                          setLayerName(`${ly.name}-${operation.toLowerCase()}`)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            ly.id === selectedSecondLayerId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {ly.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Layer settings form */}
      <LayerSettingsForm
        layerName={layerName}
        onNameChange={(name) => setLayerName(name)}
        fillColor={fillColor}
        onFillColorChange={(color) => setFillColor(color)}
        fillOpacity={fillOpacity}
        onFillOpacityChange={(opacity) => setFillOpacity(opacity)}
      />
    </ToolDialogShell>
  )
}
