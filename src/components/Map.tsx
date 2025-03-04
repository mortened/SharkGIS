import { useRef, useEffect } from 'react'
//import type { Map as MapboxMap } from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'
import { useMapStore } from '@/hooks/useMapstore'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export const BLANK_STYLE = {
    version: 8,
    sources: {},
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': 'transparent'
            }
        }
    ]
}

function Map() { 
    const mapContainer = useRef<HTMLDivElement>(null)
    //const {setMap} = useLayers()
    const { setMap } = useMapStore()
    //const map = useRef<MapboxMap | null>(null)
    
    useEffect(() => {
        if (!mapContainer.current) return

        const map = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [10.4, 63.425],
            zoom: 12
        })

        map.on('load', () => {
            setMap(map)
        })

        return () => map.remove()
    }, [])

    return <div ref={mapContainer} className="w-full h-full z-0 absolute" />
}


export default Map