import { create } from 'zustand'
import type { Feature } from 'geojson'

interface FilterCondition {
  field: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<='
  value: string | number
}

interface AttributeTableState {
  selectedLayerId: string | null
  filterConditions: FilterCondition[]
  filteredFeatures: Feature[]
  selectedFeatures: string[] // feature IDs
  
  setSelectedLayerId: (id: string | null) => void
  addFilterCondition: (condition: FilterCondition) => void
  removeFilterCondition: (index: number) => void
  clearFilters: () => void
  setSelectedFeatures: (ids: string[]) => void
}
// This Zustand store manages the state of the attribute table, including selected layer, filter conditions, and selected features.
export const useAttributeTable = create<AttributeTableState>((set) => ({
  selectedLayerId: null,
  filterConditions: [],
  filteredFeatures: [],
  selectedFeatures: [],
  
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  
  addFilterCondition: (condition) => 
    set((state) => ({ 
      filterConditions: [...state.filterConditions, condition] 
    })),
    
  removeFilterCondition: (index) =>
    set((state) => ({
      filterConditions: state.filterConditions.filter((_, i) => i !== index)
    })),
    
  clearFilters: () => set({ filterConditions: [] }),
  
  setSelectedFeatures: (ids) => set({ selectedFeatures: ids })
})) 