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
import { cn, getUniqueLayerName } from "@/lib/utils"
import { useLayers } from "@/hooks/useLayers"

interface BufferToolProps {
  selectedLayerId: string;
  setSelectedLayerId: (id: string) => void;
  bufferDistance: number | null;
  setBufferDistance: (distance: number) => void;
  layerName: string;
  setLayerName: (name: string) => void;
  errors: {
    layer: boolean;
    distance: boolean;
  }
}

export default function BufferTool({
  selectedLayerId,
  setSelectedLayerId,
  bufferDistance,
  setBufferDistance,
  setLayerName,
  errors,
}: BufferToolProps) {
  const { layers } = useLayers()
  const [open, setOpen] = useState(false)

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId)
  const buttonLabel = selectedLayer ? selectedLayer.name : "Choose input layer"
  
  return (
    <>
      <div className="mt-2 mb-4 ml-1 mr-1 flex flex-row justify-between items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="default" 
              role="combobox" 
              aria-expanded={open} 
              className={cn(
                "w-[200px] justify-between buffer-input-layer", 
                errors.layer && "border-red-500 border-2"
              )}
            >
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
                        setLayerName(getUniqueLayerName(layer.name + "-buffer"))
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
          placeholder="Enter buffer distance [m]"
          value={bufferDistance ?? ""}
          onChange={(e) => setBufferDistance(Number(e.target.value))}
          className={cn(
            "w-[210px] buffer-distance", 
            errors.distance && "border-red-500 border-2"
          )}
          min={0}
          step={1}
        />
      </div>

      <div className="text-red-500 text-sm m-auto text-center pb-2">
        {errors.layer && errors.distance ? (
          <p>Please select a layer and enter a buffer distance.</p>
        ) : errors.layer ? (
          <p>Please select a layer.</p>
        ) : errors.distance ? (
          <p>Please enter a buffer distance.</p>
        ) : null}
      </div>
    </>
  )
}