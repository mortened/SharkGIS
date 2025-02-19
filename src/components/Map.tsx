import { useRef, useEffect } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

function Map() { 
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<MapboxMap | null>(null)
    
    useEffect(() => {
        if (map.current) return
        map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [10.4, 63.425],
            zoom: 12
        })
    }, [])

    return <div ref={mapContainer} className="w-full h-full z-0 absolute" />
}

export default Map