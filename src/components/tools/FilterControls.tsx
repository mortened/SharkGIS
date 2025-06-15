"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAttributeTable } from "@/hooks/useAttributeTable";
import { useLayers } from "@/hooks/useLayers";
import { X } from "lucide-react";

// FilterControls component allows users to add and manage filter conditions for the attribute table.
export function FilterControls() {
  const { layers } = useLayers();
  const {
    selectedLayerId,
    filterConditions,
    addFilterCondition,
    removeFilterCondition,
  } = useAttributeTable();
  // Find the selected layer based on the selectedLayerId, and extract its properties.
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const properties = selectedLayer?.data.features[0]?.properties || {};
  // state management for filter controls
  const [selectedField, setSelectedField] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<
    "=" | "!=" | ">" | "<" | ">=" | "<="
  >("=");
  const [filterValue, setFilterValue] = useState("");
  // filter logic for an added filter condition
  const handleAddFilter = () => {
    // Validate inputs
    if (!selectedField || !filterValue) return;
    // new filter condition
    addFilterCondition({
      field: selectedField,
      operator: selectedOperator,
      value: filterValue,
    });

    // Reset inputs
    setSelectedField("");
    setSelectedOperator("=");
    setFilterValue("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-8">
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger
            className="w-[180px] select-field"
            data-testid="select-field"
          >
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(properties).map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedOperator}
          onValueChange={(value: any) => setSelectedOperator(value)}
        >
          <SelectTrigger
            className="w-[120px] operator-select"
            data-testid="operator-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="=">=</SelectItem>
            <SelectItem value="!=">!=</SelectItem>
            <SelectItem value=">">{">"}</SelectItem>
            <SelectItem value="<">{"<"}</SelectItem>
            <SelectItem value=">=">{">="}</SelectItem>
            <SelectItem value="<=">{"<="}</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="Value"
          className="w-[180px] value-input"
          data-testid="value-input"
        />

        <Button
          className="ml-auto"
          onClick={handleAddFilter}
          data-testid="add-filter-btn"
        >
          Add Filter
        </Button>
      </div>

      {/* Display active filters horizontally */}
      {filterConditions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterConditions.map((condition, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
            >
              <span>
                {condition.field} {condition.operator} {condition.value}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-muted-foreground/20"
                onClick={() => removeFilterCondition(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
