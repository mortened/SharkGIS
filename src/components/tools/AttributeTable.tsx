"use client";
import { useLayers } from "@/hooks/useLayers";
import { useAttributeTable } from "@/hooks/useAttributeTable";
import { DataTable } from "./DataTable";
import { featureKey } from "@/lib/utils";

export function AttributeTable() {
  const { layers } = useLayers();
  const { selectedLayerId, filterConditions } = useAttributeTable();

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  // If no layer is selected, tell the user
  if (!selectedLayer) {
    return (
      <div className="flex items-center justify-center h-32 border rounded-md">
        <p className="text-muted-foreground">No layer selected</p>
      </div>
    );
  }

  const features = selectedLayer.data.features;
  // Apply filters to the data
  const filteredData = features
    .filter((feature) => {
      return filterConditions.every((condition) => {
        const value = feature.properties?.[condition.field];
        const filterValue = condition.value;
        // Filter by the condition's operator
        switch (condition.operator) {
          case "=":
            return value == filterValue;
          case "!=":
            return value != filterValue;
          case ">":
            return Number(value) > Number(filterValue);
          case "<":
            return Number(value) < Number(filterValue);
          case ">=":
            return Number(value) >= Number(filterValue);
          case "<=":
            return Number(value) <= Number(filterValue);
          default:
            return true;
        }
      });
    })
    .map((feature) => ({
      id: featureKey(feature, features.indexOf(feature)),
      ...feature.properties,
    }));
  // Return the DataTable with the filtered data
  return (
    <div className="h-full flex flex-col min-h-0 attribute-table">
      <DataTable data={filteredData} />
    </div>
  );
}
