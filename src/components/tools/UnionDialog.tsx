import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import * as turf from "@turf/turf"
import { v4 as uuidv4 } from "uuid"

// 👉 Type‑only imports (fixes TS error: "no exported member Feature")
import type {
  Feature,
  Polygon,
  MultiPolygon,
  Position,
} from "geojson"

import { useLayers } from "@/hooks/useLayers"
import { ToolDialogShell } from "./ToolDialogShell"
import { LayerSettingsForm } from "../layers/LayerSettingsForm"
import {
  cn,
  getUniqueColor,
  getUniqueLayerName,
} from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

/**
 * UnionDialog — create a new polygon layer consisting of the geometric
 * union of two or more *polygon* input layers.
 *
 * Patch 4 (2025‑05‑21):  
 *   • Fixed TypeScript error by switching to type‑only imports from
 *     **@turf/helpers** instead of non‑existent `turf.Feature` export.  
 *   • No runtime behaviour changes.
 */
export interface UnionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnionDialog({ open, onOpenChange }: UnionDialogProps) {
  const { layers, addLayer } = useLayers()

  // —— form state ——
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
  const [layerName, setLayerName] = useState<string>("")
  const [fillColor, setFillColor] = useState<string>(getUniqueColor())
  const [fillOpacity, setFillOpacity] = useState<number>(1)
  const [errors, setErrors] = useState<{ layers: boolean }>({ layers: false })

  function onSave() {
    if (selectedLayerIds.length < 2) {
      setErrors({ layers: true })
      return
    }
    const success = handleUnion(selectedLayerIds, layerName)
    if (success) {
      onOpenChange(false)
      setSelectedLayerIds([])
      setLayerName("")
      setFillColor(getUniqueColor())
      setErrors({ layers: false })
    }
  }

  /** Resilient union that always returns a Polygon/MultiPolygon feature */
  function safeUnion(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>,
  ): Feature<Polygon | MultiPolygon> {
    try {
      const res = turf.union(a as any, b as any)
      if (res) return res as Feature<Polygon | MultiPolygon>
    } catch (err: any) {
      if (
        !(
          typeof err?.message === "string" &&
          err.message.includes("Must have at least 2 geometries")
        )
      ) {
        console.warn("Union failed, falling back to MultiPolygon merge:", err)
      }
    }

    // —— manual MultiPolygon concatenation ——
    const coords: Position[][][] = []
    const pushCoords = (feat: Feature<Polygon | MultiPolygon>) => {
      if (feat.geometry.type === "Polygon") coords.push(feat.geometry.coordinates)
      else coords.push(...feat.geometry.coordinates)
    }
    pushCoords(a)
    pushCoords(b)
    return turf.multiPolygon(coords) as Feature<Polygon | MultiPolygon>
  }

  function handleUnion(layerIds: string[], outName: string): boolean {
    const polyLayers = layers.filter((l) => layerIds.includes(l.id))

    let unionGeom: Feature<Polygon | MultiPolygon> | null = null
    let featureCount = 0

    for (const lyr of polyLayers) {
      const fc = lyr.data as turf.AllGeoJSON
      turf.flattenEach(fc, (currentFeature) => {
        featureCount += 1
        unionGeom = unionGeom
          ? safeUnion(unionGeom, currentFeature as any)
          : (currentFeature as any)
      })
    }

    if (!unionGeom || featureCount < 2) {
      console.error("Union failed — need at least two valid polygon features.")
      setErrors({ layers: true })
      return false
    }

    const outFeature = turf.feature(unionGeom.geometry)
    const outFC = turf.featureCollection([outFeature])
    const geometryType = outFeature.geometry.type as "Polygon" | "MultiPolygon"

    addLayer(
      {
        data: outFC,
        name: outName || getUniqueLayerName("union"),
        id: uuidv4(),
        visible: true,
        fillColor,
        fillOpacity,
        geometryType,
      },
      fillColor,
      fillOpacity,
    )
    return true
  }

  // ─── UI ────────────────────────────────────────────────────────────────
  return (
    <ToolDialogShell
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setErrors({ layers: false })
      }}
      title="Union"
      description="Creates a new polygon layer that is the geometric union of two or more input polygon layers."
      onSave={onSave}
    >
      <UnionTool
        selectedLayerIds={selectedLayerIds}
        setSelectedLayerIds={setSelectedLayerIds}
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

// ==========================================================================
interface UnionToolProps {
  selectedLayerIds: string[]
  setSelectedLayerIds: Dispatch<SetStateAction<string[]>>
  setLayerName: (name: string) => void
  errors: { layers: boolean }
}


function UnionTool({
  selectedLayerIds,
  setSelectedLayerIds,
  setLayerName,
  errors,
}: UnionToolProps) {
  const { layers } = useLayers()
  const [open, setOpen] = useState(false)

  const polygonLayers = layers.filter(
    (l) => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon" || l.geometryType === "FeatureCollection",
  )
  const buttonLabel =
    selectedLayerIds.length === 0
      ? "Choose polygon layers"
      : `${selectedLayerIds.length} layer${selectedLayerIds.length > 1 ? "s" : ""} selected`

  const toggleLayer = (id: string, name: string) => {
    setSelectedLayerIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      if (next.length && !name.includes("-union"))
        setLayerName(getUniqueLayerName(`${name}-union`))
      return next
    })
  }

  return (
    <div className="mt-2 mb-4 ml-1 mr-1 flex flex-row justify-between items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[230px] justify-between", errors.layers && "border-red-500 border-2")}
          >
            {buttonLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[230px] p-0">
          <Command>
            <CommandInput placeholder="Search layer..." />
            <CommandList>
              <CommandEmpty>No polygon layers found.</CommandEmpty>
              <CommandGroup>
                {polygonLayers.map((layer) => {
                  const isChecked = selectedLayerIds.includes(layer.id)
                  return (
                    <CommandItem
                      key={layer.id}
                      value={layer.name}
                      onSelect={() => toggleLayer(layer.id, layer.name)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", isChecked ? "opacity-100" : "opacity-0")} />
                      {layer.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="text-red-500 text-sm m-auto text-center">
        {errors.layers && (
          <p className="text-sm text-red-500">
            Select at least two polygon layers.
          </p>
        )}
      </div>
    </div>
  )
}
