import { useState } from "react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import { Input } from "../ui/input"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLayers } from "@/hooks/useLayers"

interface IntersectToolProps {
  selectedFirstLayerId: string
  setSelectedFirstLayerId: (id: string) => void
  selectedSecondLayerId: string
  setSelectedSecondLayerId: (id: string) => void
  layerName: string
  setLayerName: (name: string) => void
}

export default function IntersectTool({
  selectedFirstLayerId,
  setSelectedFirstLayerId,
  selectedSecondLayerId,
  setSelectedSecondLayerId,
  layerName,
  setLayerName,
}: IntersectToolProps) {
  const { layers } = useLayers()

  // Separate states for the two popovers:
  const [openFirst, setOpenFirst] = useState(false)
  const [openSecond, setOpenSecond] = useState(false)

  const selectedFirstLayer = layers.find((layer) => layer.id === selectedFirstLayerId)
  const selectedSecondLayer = layers.find((layer) => layer.id === selectedSecondLayerId)

  const firstButtonLabel = selectedFirstLayer ? selectedFirstLayer.name : "Choose first layer"
  const secondButtonLabel = selectedSecondLayer ? selectedSecondLayer.name : "Choose second layer"

  return (
    <div className="space-y-4">
      {/* First Layer Popover */}
      <Popover open={openFirst} onOpenChange={setOpenFirst}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            aria-expanded={openFirst}
            className="w-[200px] justify-between"
          >
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
                {layers.map((layer) => (
                  <CommandItem
                    key={layer.id}
                    value={layer.name}
                    onSelect={() => {
                      setSelectedFirstLayerId(layer.id)
                      setLayerName(layer.name + "-intersect")
                      setOpenFirst(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        layer.id === selectedFirstLayerId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {layer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Second Layer Popover */}
      <Popover open={openSecond} onOpenChange={setOpenSecond}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            aria-expanded={openSecond}
            className="w-[200px] justify-between"
          >
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
                {layers.map((layer) => (
                  <CommandItem
                    key={layer.id}
                    value={layer.name}
                    onSelect={() => {
                      setSelectedSecondLayerId(layer.id)
                      setLayerName(layer.name + "-intersect")
                      setOpenSecond(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        layer.id === selectedSecondLayerId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {layer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Intersect Layer Name */}
      <Input
        type="text"
        placeholder="Enter intersect layer name"
        value={layerName}
        onChange={(e) => setLayerName(e.target.value)}
      />
    </div>
  )
}
