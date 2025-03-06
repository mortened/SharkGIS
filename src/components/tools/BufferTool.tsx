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
} from "../ui/command"
import { Input } from "../ui/input"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLayers } from "@/hooks/useLayers"

interface BufferToolProps {
  selectedLayerId: string;
  setSelectedLayerId: (id: string) => void;
  bufferDistance: number | null;
  setBufferDistance: (distance: number) => void;
  layerName: string;
  setLayerName: (name: string) => void;
}

export default function BufferTool({
  selectedLayerId,
  setSelectedLayerId,
  bufferDistance,
  setBufferDistance,
  layerName,
  setLayerName,
}: BufferToolProps) {
  const { layers } = useLayers()
  const [open, setOpen] = useState(false)

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId)
  const buttonLabel = selectedLayer ? selectedLayer.name : "Choose input layer"

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="default" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
            {buttonLabel}
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
                      setSelectedLayerId(layer.id)
                      setLayerName(layer.name + "-buffer")
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        layer.id === selectedLayerId ? "opacity-100" : "opacity-0"
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

      <Input
        type="number"
        placeholder="Enter buffer distance"
        value={bufferDistance ?? ""}
        onChange={(e) => setBufferDistance(Number(e.target.value))}
      />

      <Input
        type="text"
        placeholder="Enter buffer layer name"
        value={layerName}
        onChange={(e) => setLayerName(e.target.value)}
      />
    </div>
  )
}
