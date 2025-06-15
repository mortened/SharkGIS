import {create} from 'zustand'
import MapboxDraw from "@mapbox/mapbox-gl-draw"

interface DrawState {
    draw: MapboxDraw | null
    setDraw: (draw: MapboxDraw) => void
}
// This Zustand store manages the state of the Mapbox Draw instance, allowing components to access and modify the draw state.
export const useDrawStore = create<DrawState>((set) => ({
    draw: null,
    setDraw: (draw) => set({draw})
}))

