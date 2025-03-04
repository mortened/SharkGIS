import type { Map } from 'mapbox-gl'
import { Layer } from '@/hooks/useLayers'
import mapboxgl from 'mapbox-gl'

export const mapService = {
    initializeMap: (container: HTMLDivElement) => {
        return new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [10.4, 63.425],
            zoom: 12
        })
    },

    reloadLayers: (map: Map, layers: Layer[]) => {

        layers.forEach((layer) => {
            // Derive the correct "layerType"
            let layerType: 'fill' | 'circle' | 'line' = 'fill'
            if (layer.geometryType.includes('Point')) {
            layerType = 'circle'
            } else if (layer.geometryType.includes('LineString')) {
            layerType = 'line'
            }
        
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
                'fill-opacity': layer.fillOpacity,
                }),
                ...(layerType === 'circle' && {
                'circle-color': layer.fillColor,
                'circle-opacity': layer.fillOpacity,
                'circle-radius': 5
                }),
                ...(layerType === 'line' && {
                'line-color': layer.fillColor,
                'line-opacity': layer.fillOpacity,
                'line-width': 2
                }),
            },
            layout: {
                        visibility: layer.visible ? 'visible' : 'none'
                    }
                })
            })
        
            }
        }
