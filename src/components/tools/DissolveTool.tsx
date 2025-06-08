import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, getUniqueLayerName } from "@/lib/utils";
import { useLayers } from "@/hooks/useLayers";

interface DissolveToolProps {
  selectedLayerId: string;
  setSelectedLayerId: (id: string) => void;
  dissolveField: string | null;
  setDissolveField: (f: string | null) => void;
  layerName: string;
  setLayerName: (n: string) => void;
  errors: {
    layer: boolean;
  };
}

export default function DissolveTool({
  selectedLayerId,
  setSelectedLayerId,
  dissolveField,
  setDissolveField,
  setLayerName,
  errors,
}: DissolveToolProps) {
  const { layers } = useLayers();
  const [layerOpen, setLayerOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);

  const selected = layers.find((l) => l.id === selectedLayerId);
  const buttonLabel = selected ? selected.name : "Choose input layer";

  /** list attribute keys present in the first feature (simple heuristic) */
  const availableFields = useMemo(() => {
    if (!selected) return [];
    const f = selected.data.features.find((g) => g.properties);
    return f ? Object.keys(f.properties!) : [];
  }, [selected]);

  return (
    <>
      <div className="space-y-4">
        <Popover open={layerOpen} onOpenChange={setLayerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              className={cn(
                "w-full justify-between dissolve-input-layer",
                errors.layer && "border-red-500 border-2"
              )}
            >
              {buttonLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
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
                        setSelectedLayerId(l.id);
                        setLayerName(getUniqueLayerName(`${l.name}-dissolve`));
                        setDissolveField(null); // reset field when layer changes
                        setLayerOpen(false);
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
          <Popover open={fieldOpen} onOpenChange={setFieldOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="w-full justify-between dissolve-field"
              >
                {dissolveField ?? "Dissolve by field (optional)"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
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

        <div className="text-red-500 text-sm m-auto text-center pb-2">
          {errors.layer && <p>Please select a layer.</p>}
        </div>
      </div>
    </>
  );
}
