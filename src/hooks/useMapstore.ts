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

export const BASE_STYLES = {
    streets: "mapbox://styles/mapbox/streets-v12",
    outdoors: "mapbox://styles/mapbox/outdoors-v12",
    light: "mapbox://styles/mapbox/light-v11",
    dark: "mapbox://styles/mapbox/dark-v11",
    satellite: "mapbox://styles/mapbox/satellite-v9",
    satelliteStreets: "mapbox://styles/mapbox/satellite-streets-v12",
    navigationDay: "mapbox://styles/mapbox/navigation-day-v1",
    navigationNight: "mapbox://styles/mapbox/navigation-night-v1",
    blueprint: "mapbox://styles/mortened/cmai5mq6e00y601qyh8e5dmrv",
    Blank: "blank",
}

type StyleKey = keyof typeof BASE_STYLES

function getLayerTypeAndPaint(layer: {
    geometryType: string;
    fillColor: string;
    fillOpacity: number;
  }): {
    layerType: 'fill' | 'line' | 'circle';
    paint: mapboxgl.AnyPaint;
  } {
    let layerType: 'fill' | 'line' | 'circle' = 'fill';
  
    if (layer.geometryType === 'Point' || layer.geometryType === 'MultiPoint') {
      layerType = 'circle';
    } else if (layer.geometryType === 'LineString' || layer.geometryType === 'MultiLineString') {
      layerType = 'line';
    }
  
    const paint: mapboxgl.AnyPaint = layerType === 'fill'
      ? {
          'fill-color': layer.fillColor,
          'fill-opacity': layer.fillOpacity,
        }
      : layerType === 'line'
      ? {
          'line-color': layer.fillColor,
          'line-opacity': layer.fillOpacity,
          'line-width': 2,
        }
      : {
          'circle-color': layer.fillColor,
          'circle-opacity': layer.fillOpacity,
          'circle-radius': 5,
        };
  
    return { layerType, paint };
  }
  



interface MapState {
    map: Map | null
    isBaseVisible: boolean
    setMap: (map: Map) => void
    toggleBaseVisibility: () => Promise<void>
    updateMapLayers: () => void
    updateMapStyle: (key: StyleKey) => void
    currentStyle: StyleKey
}

export const useMapStore = create<MapState>((set, get) => ({
    map: null,
    isBaseVisible: true,
    currentStyle: "dark",
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
        const styleToSet = newVisibility ? BASE_STYLES[get().currentStyle] : BLANK_STYLE
        map.setStyle(styleToSet)

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
      
        // Remove all existing layers and sources
        layers.forEach(layer => {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
          if (map.getSource(layer.id)) {
            map.removeSource(layer.id);
          }
        });
      
        // Re-add layers in new order with correct paint properties
        layers.forEach(layer => {
          map.addSource(layer.id, {
            type: 'geojson',
            data: layer.data
          });
      
          let layerType: 'fill' | 'line' | 'circle' = 'fill';
          if (layer.geometryType === 'Point' || layer.geometryType === 'MultiPoint') {
            layerType = 'circle';
          } else if (layer.geometryType === 'LineString' || layer.geometryType === 'MultiLineString') {
            layerType = 'line';
          }
      
          const paint: mapboxgl.AnyPaint = layerType === 'fill'
            ? {
                'fill-color': layer.fillColor,
                'fill-opacity': layer.fillOpacity,
              }
            : layerType === 'line'
            ? {
                'line-color': layer.fillColor,
                'line-opacity': layer.fillOpacity,
                'line-width': 2,
              }
            : {
                'circle-color': layer.fillColor,
                'circle-opacity': layer.fillOpacity,
                'circle-radius': 5,
              };
      
          map.addLayer({
            id: layer.id,
            type: layerType,
            source: layer.id,
            paint,
            layout: {
              visibility: layer.visible ? 'visible' : 'none'
            }
          });
        });
      },
      
    updateMapStyle: (key: StyleKey) => {
        const { map, isBaseVisible } = get()
        if (!map) return

        // Remember the choice immediately
        set({ currentStyle: key });

        // If basemap was hidden, show it
        if (!isBaseVisible) {
            set({ isBaseVisible: true });
        }

        const style = key === "Blank" ? BLANK_STYLE : BASE_STYLES[key];
        map.setStyle(style);
    
        // Wait for style to load and restore layers
        map.once('style.load', () => {
            const layers = useLayers.getState().layers
            layers.forEach(layer => {
                map.addSource(layer.id, {
                    type: 'geojson',
                    data: layer.data
                });
    
                const { layerType, paint } = getLayerTypeAndPaint(layer);
                map.addLayer({
                id: layer.id,
                type: layerType,
                source: layer.id,
                paint,
                layout: {
                    visibility: layer.visible ? 'visible' : 'none'
                }
                });
            });
        })
    }
}))