import {create} from 'zustand'
import MapboxDraw from "@mapbox/mapbox-gl-draw"

interface DrawState {
    draw: MapboxDraw | null
    setDraw: (draw: MapboxDraw) => void
}

export const useDrawStore = create<DrawState>((set) => ({
    draw: null,
    setDraw: (draw) => set({draw})
}))

