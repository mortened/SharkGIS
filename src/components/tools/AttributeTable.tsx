"use client"
import { useLayers } from "@/hooks/useLayers"
import { useAttributeTable } from "@/stores/useAttributeTable"
import { DataTable } from "./DataTable"



export function AttributeTable() {
  const { layers } = useLayers()
  const { selectedLayerId, filterConditions } = useAttributeTable()
  
  const selectedLayer = layers.find(layer => layer.id === selectedLayerId)
  
  if (!selectedLayer) {
    return (
      <div className="flex items-center justify-center h-32 border rounded-md">
        <p className="text-muted-foreground">No layer selected</p>
      </div>
    )
  }

  // Apply filters to the data
  const filteredData = selectedLayer.data.features
    .filter(feature => {
      return filterConditions.every(condition => {
        const value = feature.properties?.[condition.field]
        const filterValue = condition.value

        switch (condition.operator) {
          case "=":
            return value == filterValue
          case "!=":
            return value != filterValue
          case ">":
            return value > filterValue
          case "<":
            return value < filterValue
          case ">=":
            return value >= filterValue
          case "<=":
            return value <= filterValue
          default:
            return true
        }
      })
    })
    .map(feature => ({
      id: feature.id || feature.properties?.id || Math.random().toString(),
      ...feature.properties
    }))

  return (
    <div className="h-full flex flex-col min-h-0">
      <DataTable data={filteredData} />
    </div>
  )
}