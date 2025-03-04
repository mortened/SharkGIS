import { create } from "zustand"
import type { Map } from 'mapbox-gl'
import { useLayers } from "./useLayers"

export const BLANK_STYLE = {
    version: 8,
    sources: {},
    layers: [{
        id: 'background',
        type: 'background',
        paint: {
            'background-color': 'transparent'
        }
    }]
} as mapboxgl.Style

interface MapState {
    map: Map | null
    isBaseVisible: boolean
    setMap: (map: Map) => void
    toggleBaseVisibility: () => Promise<void>
    updateMapLayers: () => void
}

export const useMapStore = create<MapState>((set, get) => ({
    map: null,
    isBaseVisible: true,
    setMap: (map) => set({ map }),
    toggleBaseVisibility: async () => {
        const { map, isBaseVisible } = get()
        if (!map) return

        const newVisibility = !isBaseVisible
        const layers = useLayers.getState().layers
        
        // Save current camera position
        const center = map.getCenter()
        const zoom = map.getZoom()
        const bearing = map.getBearing()
        const pitch = map.getPitch()

        console.log('Changing style to:', newVisibility ? 'streets' : 'blank')

        // Change style
        if (newVisibility) {
            map.setStyle('mapbox://styles/mapbox/dark-v11')
        } else {
            map.setStyle(BLANK_STYLE)
        }

        // Wait for style to load and restore layers
        await new Promise<void>((resolve) => {
            map.once('style.load', () => {
                // Restore camera position
                map.setCenter(center)
                map.setZoom(zoom)
                map.setBearing(bearing)
                map.setPitch(pitch)

                // Re-add all GeoJSON layers
                layers.forEach(layer => {

                    // Derive the correct "layerType"
                    let layerType: 'fill' | 'circle' | 'line' = 'fill'
                    if (layer.geometryType.includes('Point')) {
                        layerType = 'circle'
                    } else if (layer.geometryType.includes('LineString')) {
                        layerType = 'line'
                    }

                    // Add the source
                    map.addSource(layer.id, {
                        type: 'geojson',
                        data: layer.data
                    })
                    
                    map.addLayer({
                        id: layer.id,
                        type: layerType,
                        source: layer.id,
                        paint: {
                            ...(layerType === 'fill' && {
                                'fill-color': layer.fillColor,
                                'fill-opacity': layer.fillOpacity
                            }),
                            ...(layerType === 'circle' && {
                                'circle-color': layer.fillColor,
                                'circle-opacity': layer.fillOpacity,
                            }),
                            ...(layerType === 'line' && {
                                'line-color': layer.fillColor,
                                'line-opacity': layer.fillOpacity,
                                'line-width': 2,
                            }),
                        },
                            layout: {   
                            visibility: layer.visible ? 'visible' : 'none'
                        }
                    })
                })

                resolve()
            })
        })
        console.log('Setting new visibility:', newVisibility)

        set({ isBaseVisible: newVisibility })
    },
    updateMapLayers: () => {
        const { map } = get();
        const layers = useLayers.getState().layers;

        if (!map) return;

        // Remove all layers
        layers.forEach(layer => {
            if (map.getLayer(layer.id)) {
                map.removeLayer(layer.id);
                map.removeSource(layer.id);
            }
        });

        // Re-add layers in the new order
        layers.forEach(layer => {
            map.addSource(layer.id, {
                type: 'geojson',
                data: layer.data
            });

            map.addLayer({
                id: layer.id,
                type: layer.geometryType === 'Point' ? 'circle' : layer.geometryType === 'LineString' ? 'line' : 'fill',
                source: layer.id,
                paint: {
                    'fill-color': layer.fillColor,
                    'fill-opacity': layer.fillOpacity,
                    'circle-color': layer.fillColor,
                    'circle-opacity': layer.fillOpacity,
                    'line-color': layer.fillColor,
                    'line-opacity': layer.fillOpacity,
                },
                layout: {
                    visibility: layer.visible ? 'visible' : 'none'
                }
            });
        });
    }
}))