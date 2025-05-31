import { useState } from "react"
import type { Dispatch, SetStateAction, ReactElement } from "react"
import * as turf from "@turf/turf"
import { v4 as uuidv4 } from "uuid"

// Type-only geojson imports
import type {
  Feature,
  Position,
  Geometry,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
} from "geojson"

import { useLayers } from "@/hooks/useLayers"
import { ToolDialogShell } from "./ToolDialogShell"
import { LayerSettingsForm } from "../layers/LayerSettingsForm"
import { cn, getUniqueColor, getUniqueLayerName } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
 * ClipDialog — Clips an *input* layer (points, lines or polygons) by one or more *polygon* clip layers.
 *
 * Patch 1 (2025-05-29) — initial implementation.
 */
export interface ClipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClipDialog({ open, onOpenChange }: ClipDialogProps): ReactElement {
  const { layers, addLayer } = useLayers()

  // ——— form state ———
  const [inputLayerId, setInputLayerId] = useState<string | null>(null)
  const [clipLayerIds, setClipLayerIds] = useState<string[]>([])
  const [layerName, setLayerName] = useState<string>("")
  const [fillColor, setFillColor] = useState<string>(getUniqueColor())
  const [fillOpacity, setFillOpacity] = useState<number>(1)
  const [errors, setErrors] = useState<{ input: boolean; clip: boolean }>({
    input: false,
    clip: false,
  })

  // ——— helpers ———
  /** Resilient polygon union */
  function safeUnion(
    a: Feature<Polygon | MultiPolygon>,
    b: Feature<Polygon | MultiPolygon>,
  ): Feature<Polygon | MultiPolygon> {
    try {
      const res = turf.union(a as any, b as any)
      if (res) return res as Feature<Polygon | MultiPolygon>
    } catch (_) {
      /* swallow */
    }
    const coords: Position[][][] = []
    const push = (f: Feature<Polygon | MultiPolygon>) => {
      if (f.geometry.type === "Polygon") coords.push(f.geometry.coordinates)
      else coords.push(...f.geometry.coordinates)
    }
    push(a)
    push(b)
    return turf.multiPolygon(coords) as Feature<Polygon | MultiPolygon>
  }

  /** Clip a single Point / MultiPoint */
  function clipPoints(
    feat: Feature<Point | MultiPoint>,
    maskPoly: Feature<Polygon | MultiPolygon>,
  ): Feature<Point | MultiPoint> | null {
    if (feat.geometry.type === "Point") {
      return turf.booleanPointInPolygon(feat, maskPoly) ? feat : null
    }
    const kept: Position[] = feat.geometry.coordinates.filter((pt) =>
      turf.booleanPointInPolygon(turf.point(pt), maskPoly),
    )
    return kept.length ? turf.multiPoint(kept) : null
  }

  /** Clip a single Line / MultiLine */
  function clipLine(
    feat: Feature<LineString | MultiLineString>,
    maskPoly: Feature<Polygon | MultiPolygon>,
  ): Feature<LineString | MultiLineString> | null {
    const segments: Feature<LineString>[] = []
    const fc = turf.lineSplit(feat, maskPoly)
    fc.features.forEach((seg) => {
      const mid = turf.along(seg, turf.length(seg) / 2)
      if (turf.booleanPointInPolygon(mid, maskPoly)) segments.push(seg)
    })
    if (!segments.length) return null
    if (segments.length === 1) return segments[0]
    const mlCoords = segments.map((s) => s.geometry.coordinates)
    return turf.multiLineString(mlCoords)
  }

  /** Clip a Polygon / MultiPolygon (intersection) */
  function clipPolygon(
    feat: Feature<Polygon | MultiPolygon>,
    maskPoly: Feature<Polygon | MultiPolygon>,
  ): Feature<Polygon | MultiPolygon> | null {
    const res = turf.intersect(feat, maskPoly)
    return res ? (res as Feature<Polygon | MultiPolygon>) : null
  }

  function handleClip(): boolean {
    const inputLayer = layers.find((l) => l.id === inputLayerId)
    const clipLayers = layers.filter((l) => clipLayerIds.includes(l.id))

    if (!inputLayer || !clipLayers.length) return false

    // —— build union mask ——
    let mask: Feature<Polygon | MultiPolygon> | null = null
    for (const lyr of clipLayers) {
      turf.flattenEach(lyr.data as turf.AllGeoJSON, (f) => {
        mask = mask ? safeUnion(mask!, f as any) : (f as any)
      })
    }
    if (!mask) return false

    // —— iterate input features ——
    const out: Feature<Geometry>[] = []
    turf.flattenEach(inputLayer.data as turf.AllGeoJSON, (f) => {
      const t = f.geometry.type
      let clipped: Feature<Geometry> | null = null
      if (t === "Point" || t === "MultiPoint") {
        clipped = clipPoints(f as any, mask!) as any
      } else if (t === "LineString" || t === "MultiLineString") {
        clipped = clipLine(f as any, mask!) as any
      } else if (t === "Polygon" || t === "MultiPolygon") {
        clipped = clipPolygon(f as any, mask!) as any
      }
      if (clipped) out.push({ ...clipped, properties: f.properties })
    })

    if (!out.length) return false

    const outFC = turf.featureCollection(out)
    const geometryType = inputLayer.geometryType

    addLayer(
      {
        data: outFC,
        name: layerName || getUniqueLayerName("clip"),
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

  // ——— save handler ———
  function onSave() {
    const errInput = !inputLayerId
    const errClip = !clipLayerIds.length
    setErrors({ input: errInput, clip: errClip })
    if (errInput || errClip) return

    const success = handleClip()
    if (!success) return

    onOpenChange(false)
    setInputLayerId(null)
    setClipLayerIds([])
    setLayerName("")
    setFillColor(getUniqueColor())
    setErrors({ input: false, clip: false })
  }

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setErrors({ input: false, clip: false })
      }}
      title="Clip"
      description="Creates a new layer by clipping an input layer (points, lines, polygons) to one or more polygon clip layers."
      onSave={onSave}
    >
      <ClipTool
        inputLayerId={inputLayerId}
        setInputLayerId={setInputLayerId}
        clipLayerIds={clipLayerIds}
        setClipLayerIds={setClipLayerIds}
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

// —————————————————————————————————————————— UI —————————————————————————————————
interface ClipToolProps {
  inputLayerId: string | null
  setInputLayerId: (id: string | null) => void
  clipLayerIds: string[]
  setClipLayerIds: Dispatch<SetStateAction<string[]>>
  setLayerName: (name: string) => void
  errors: { input: boolean; clip: boolean }
}

function ClipTool({
  inputLayerId,
  setInputLayerId,
  clipLayerIds,
  setClipLayerIds,
  setLayerName,
  errors,
}: ClipToolProps): ReactElement {
  const { layers } = useLayers()
  const [inputOpen, setInputOpen] = useState(false)
  const [clipOpen, setClipOpen] = useState(false)

  const allLayers = layers // any geometry for input
  const polygonLayers = layers.filter(
    (l) => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon" || l.geometryType === "FeatureCollection",
  )

  const selectInput = (id: string, name: string) => {
    setInputLayerId((curr) => (curr === id ? null : id))
    if (!name.includes("-clip")) setLayerName(getUniqueLayerName(`${name}-clip`))
    setClipLayerIds((prev) => prev.filter((x) => x !== id))
    setInputOpen(false)
  }

  const toggleClipLayer = (id: string, name: string) => {
    setClipLayerIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      if (inputLayerId && !name.includes("-clip")) {
        const inputName = layers.find((l) => l.id === inputLayerId)?.name || ""
        setLayerName(getUniqueLayerName(`${inputName}-clip`))
      }
      return next
    })
    // keep open for multi-select
  }

  const inputLabel = inputLayerId ? layers.find((l) => l.id === inputLayerId)?.name ?? "Choose input layer" : "Choose input layer"
  const clipLabel = clipLayerIds.length ? `${clipLayerIds.length} clip polygon${clipLayerIds.length > 1 ? "s" : ""}` : "Choose clip polygons"

  return (
    <>
    <div className="mb-2 ml-1 mr-1 flex flex-row gap-3">
      {/* Input layer */}
      <Popover open={inputOpen} onOpenChange={setInputOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            className={cn("w-[230px] justify-between", errors.input && "border-red-500 border-2")}
          >
            {inputLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[230px] p-0" aria-label="Input layer list">
          <Command>
            <CommandInput placeholder="Search layer..." />
            <CommandList>
              <CommandEmpty>No layers found.</CommandEmpty>
              <CommandGroup>
                {allLayers.map((layer) => {
                  const isChecked = inputLayerId === layer.id
                  return (
                    <CommandItem key={layer.id} value={layer.name} onSelect={() => selectInput(layer.id, layer.name)}>
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

      {/* Clip polygons */}
      <Popover open={clipOpen} onOpenChange={setClipOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            className={cn("w-[230px] justify-between", errors.clip && "border-red-500 border-2")}
          >
            {clipLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[230px] p-0" aria-label="Clip polygon list">
          <Command>
            <CommandInput placeholder="Search layer..." />
            <CommandList>
              <CommandEmpty>No polygon layers found.</CommandEmpty>
              <CommandGroup>
                {polygonLayers
                  .filter((l) => l.id !== inputLayerId)
                  .map((layer) => {
                    const isChecked = clipLayerIds.includes(layer.id)
                    return (
                      <CommandItem key={layer.id} value={layer.name} onSelect={() => toggleClipLayer(layer.id, layer.name)}>
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
    </div>
    <div className="text-red-500 text-sm m-auto text-center mb-2">
      {errors.input && errors.clip ? (
        <p className="text-sm text-red-500">Select an input layer and at least one clip polygon layer.</p>
      ) : errors.input ? (
        <p className="text-sm text-red-500">Select an input layer.</p>
      ) : errors.clip ? (
        <p className="text-sm text-red-500">Select at least one clip polygon layer.</p>
      ) : null}
    </div>
    </>
  )
}