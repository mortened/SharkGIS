import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useLayers } from "@/hooks/useLayers";
import { AttributeTable } from "./AttributeTable";
import { useAttributeTable } from "@/hooks/useAttributeTable";
import { FilterControls } from "./FilterControls";

interface FeatureExtractionDialogProps {
  selectedLayerId: string;
  setSelectedLayerId: (id: string) => void;
}

export default function FeatureExtractionDialog({
  selectedLayerId,
  setSelectedLayerId,
}: FeatureExtractionDialogProps) {
  const { layers } = useLayers();
  const { setSelectedLayerId: setTableLayerId } = useAttributeTable();
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const buttonLabel = selectedLayer ? selectedLayer.name : "Choose input layer";
  const [open, setOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    setTableLayerId(selectedLayerId);
    setShowTable(true);
  }, [selectedLayerId, setTableLayerId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row justify-between mb-2 ">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between input-layer"
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
                        setSelectedLayerId(layer.id);
                        setTableLayerId(layer.id);
                        setOpen(false);
                      }}
                    >
                      {layer.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            {showFilters ? (
              <>
                Hide Filters <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show Filters <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={() => setShowTable(!showTable)}>
            {showTable ? "Hide" : "Show"} Table
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        {showFilters && (
          <div className="border rounded-lg p-3 bg-muted/50 mb-2">
            <FilterControls />
          </div>
        )}

        {showTable && (
          <div className="flex-1 min-h-0 border rounded-lg">
            <div className="h-full overflow-auto">
              <AttributeTable />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
