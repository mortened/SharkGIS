import { create } from "zustand"
import type { FeatureCollection } from "geojson"
import type { Map } from 'mapbox-gl'

interface Layer {
    id: string
    name: string
    data: FeatureCollection
    visible: boolean
}

interface LayerState {
    layers: Layer[]
    map: Map | null
    setMap: (map: Map) => void
    addLayer: (layer: Layer) => void
    removeLayer: (id: string) => void
    updateLayer: (id: string, layer: Layer) => void
    toggleLayer: (id: string) => void
}

export const useLayers = create<LayerState>((set, get) => ({
    layers: [],
    map: null,
    setMap: (map) => set({ map }),
    addLayer: (layer) => {
        const map = get().map
        if (map) {
            // Add source
            map.addSource(layer.id, {
                type: 'geojson',
                data: layer.data
            })
            
            // Add layer
            map.addLayer({
                id: layer.id,
                type: 'fill',  // or 'line', 'symbol', etc. depending on your data
                source: layer.id,
                paint: {
                    'fill-color': '#088',
                    'fill-opacity': 0.8
                },
                layout: {
                    visibility: layer.visible ? 'visible' : 'none'
                }
            })
        }
        
        set((state) => ({ 
            layers: [...state.layers, layer] 
        }))
    },
    removeLayer: (id) => {
        const map = get().map
        if (map) {
            if (map.getLayer(id)) map.removeLayer(id)
            if (map.getSource(id)) map.removeSource(id)
        }
        
        set((state) => ({ 
            layers: state.layers.filter((layer) => layer.id !== id) 
        }))
    },
    updateLayer: (id, layer) => {
        const map = get().map
        if (map && map.getSource(id)) {
            (map.getSource(id) as mapboxgl.GeoJSONSource).setData(layer.data)
        }
        
        set((state) => ({
            layers: state.layers.map((l) => l.id === id ? layer : l) 
        }))
    },
    toggleLayer: (id) => {
        const map = get().map
        if (map && map.getLayer(id)) {
            const visibility = map.getLayoutProperty(id, 'visibility')
            map.setLayoutProperty(
                id,
                'visibility',
                visibility === 'visible' ? 'none' : 'visible'
            )
        }
        
        set((state) => ({
            layers: state.layers.map((layer) => 
                layer.id === id 
                    ? { ...layer, visible: !layer.visible } 
                    : layer
            )
        }))
    }
}))