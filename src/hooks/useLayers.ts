import { create } from "zustand"
import type { FeatureCollection } from "geojson"
import type { Map } from 'mapbox-gl'
import { useMapStore } from "./useMapstore"

export interface Layer {
    id: string
    name: string
    data: FeatureCollection
    fillColor: string
    fillOpacity: number
    visible: boolean
    geometryType: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'
}

interface LayerState {
    layers: Layer[]
    // map: Map | null
    // setMap: (map: Map) => void
    addLayer: (layer: Layer, fillColor: string, fillOpacity: number) => void
    removeLayer: (id: string) => void
    updateLayer: (id: string, layer: Layer) => void
    toggleLayer: (id: string) => void
    reorderLayers: (fromIndex: number, toIndex: number) => void
}

export const useLayers = create<LayerState>((set, get) => ({
    layers: [],
    // map: null,
    // setMap: (map) => set({ map }),

    addLayer: (layer) => {
        // const map = get().map;
        const map = useMapStore.getState().map
        if (!map) {
            console.error('Map is not initialized');
            return;
        }

        if (!layer || !layer.data) {
            console.error('Layer or data is undefined:', { layer });
            return;
        }

        // Ensure geometryType is set
        const geomType = layer.data.features[0]?.geometry.type; // Use optional chaining
        if (!geomType) {
            console.error('Geometry type is undefined for layer:', { layer });
            return;
        }

        let layerType = 'fill'; // Default to fill for polygons

        if (geomType === 'Point' || geomType === 'MultiPoint') {
            layerType = 'circle'; // Use circle for points
        } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
            layerType = 'line'; // Use line for lines
        }

        // Also store geometryType in the layer object so it's not undefined later:
        let geometryType: Layer['geometryType'] = 'Polygon'
        if (geomType === 'Point' || geomType === 'MultiPoint') {
            geometryType = 'Point'
        } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
            geometryType = 'LineString'
        } // else keep 'Polygon' as the default

        map.addSource(layer.id, {
            type: 'geojson',
            data: layer.data
        });


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
                    'circle-radius': 5,
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
        });

        set((state) => ({
            layers: [...state.layers, { ...layer, geometryType: layer.geometryType ?? geometryType }]
        }))
    },
    removeLayer: (id) => {
        // const map = get().map
        const map = useMapStore.getState().map
        if (map) {
            if (map.getLayer(id)) map.removeLayer(id)
            if (map.getSource(id)) map.removeSource(id)
        }
        
        set((state) => ({ 
            layers: state.layers.filter((layer) => layer.id !== id) 
        }))
    },
    updateLayer: (id: string, layer: Layer) => {
        const map = useMapStore.getState().map;
        console.log('called updateLayer with id:', id, 'and layer:', layer )
        if (!map || !map.getSource(id)) return;
        console.log('Updating layer', layer.id, 'with geometryType:', layer.geometryType, 'and color:', layer.fillColor);

        // Update the GeoJSON data
        const source = map.getSource(id) as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(layer.data);
        }

        // Update the layer's paint properties based on geometry type
        if (layer.geometryType === 'Polygon' || layer.geometryType === 'MultiPolygon') {
            map.setPaintProperty(id, 'fill-color', layer.fillColor);
            map.setPaintProperty(id, 'fill-opacity', layer.fillOpacity);
        } else if (layer.geometryType === 'Point' || layer.geometryType === 'MultiPoint') {
            map.setPaintProperty(id, 'circle-color', layer.fillColor);
            map.setPaintProperty(id, 'circle-opacity', layer.fillOpacity);
        } else if (layer.geometryType === 'LineString' || layer.geometryType === 'MultiLineString') {
            map.setPaintProperty(id, 'line-color', layer.fillColor);
            map.setPaintProperty(id, 'line-opacity', layer.fillOpacity);
        }

        // Update layer in the store
        set((state) => ({
            layers: state.layers.map((l) => (l.id === id ? layer : l))
        }));
    },
    toggleLayer: (id) => {
        // const map = get().map
        const map = useMapStore.getState().map
        if (map && map.getLayer(id)) {
            const visibility = map.getLayoutProperty(id, 'visibility')
            const newVisibility = visibility === 'visible' ? 'none' : 'visible'
            console.log(newVisibility)
            map.setLayoutProperty(
                id,
                'visibility',
                newVisibility
            )
        }
        
        set((state) => ({
            layers: state.layers.map((layer) => 
                layer.id === id 
                    ? { ...layer, visible: !layer.visible } 
                    : layer
            )
        }))
    },
    reorderLayers: (fromIndex, toIndex) => {
        const layers = get().layers;
        const movedLayer = layers[fromIndex];
        const newLayers = layers.filter((_, index) => index !== fromIndex);
        newLayers.splice(toIndex, 0, movedLayer);
        set({ layers: newLayers });
    }
}
))