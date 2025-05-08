import { useState, useMemo } from "react"
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

interface DissolveToolProps {
  selectedLayerId: string
  setSelectedLayerId: (id: string) => void
  dissolveField: string | null
  setDissolveField: (f: string | null) => void
  layerName: string
  setLayerName: (n: string) => void
}

export default function DissolveTool({
  selectedLayerId,
  setSelectedLayerId,
  dissolveField,
  setDissolveField,
  layerName,
  setLayerName,
}: DissolveToolProps) {
  const { layers } = useLayers()
  const [open, setOpen] = useState(false)

  const selected = layers.find((l) => l.id === selectedLayerId)
  const buttonLabel = selected ? selected.name : "Choose layer"

  /** list attribute keys present in the first feature (simple heuristic) */
  const availableFields = useMemo(() => {
    if (!selected) return []
    const f = selected.data.features.find((g) => g.properties)
    return f ? Object.keys(f.properties!) : []
  }, [selected])

  return (
    <div className="space-y-4">

      <div className="flex flex-row gap-4">
      {/* layer chooser */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
          >
            {buttonLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandInput placeholder="Search layer..." />
            <CommandList>
              <CommandEmpty>No layers found.</CommandEmpty>
              <CommandGroup>
                {layers.map((l) => (
                  <CommandItem
                    key={l.id}
                    value={l.name}
                    onSelect={() => {
                      setSelectedLayerId(l.id)
                      setLayerName(`${l.name}-dissolve`)
                      setDissolveField(null) // reset field when layer changes
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        l.id === selectedLayerId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {l.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* optional attribute field */}
      {selected && availableFields.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">
              {dissolveField ?? "Dissolve by field (optional)"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    key="__none__"
                    value="None"
                    onSelect={() => setDissolveField(null)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        dissolveField === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    (merge all)
                  </CommandItem>
                  {availableFields.map((fld) => (
                    <CommandItem
                      key={fld}
                      value={fld}
                      onSelect={() => setDissolveField(fld)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          fld === dissolveField ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {fld}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
      )}

    </div>

      <Input
        placeholder="Output layer name"
        value={layerName}
        onChange={(e) => setLayerName(e.target.value)}
      />
    </div>
  )
}
