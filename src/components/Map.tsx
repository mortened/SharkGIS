import { useRef, useEffect } from "react";
//import type { Map as MapboxMap } from 'mapbox-gl'
import mapboxgl from "mapbox-gl";
import { useMapStore, BASE_STYLES } from "@/hooks/useMapstore";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useDrawStore } from "@/hooks/useDrawStore";

// import mapbox access token from environment variables
// Note: Make sure to set the VITE_MAPBOX_TOKEN in .env file
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map() {
  // Refs to hold the map container and the MapboxDraw instance
  const mapContainer = useRef<HTMLDivElement>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const { setMap } = useMapStore();

  useEffect(() => {
    // Ensure the map container is available before initializing the map
    if (!mapContainer.current) return;
    // Initialize the Mapbox map in Trondheim with the dark style
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: BASE_STYLES.dark,
      center: [10.4, 63.425],
      zoom: 12,
      preserveDrawingBuffer: true, // for exporting to PNG
    });
    // allow drawing on the map
    drawRef.current = new MapboxDraw({
      displayControlsDefault: true,
    });
    // add the draw control to the map, in the top left corner (hidden behind the sidebar)
    map.addControl(drawRef.current, "top-left");
    useDrawStore.getState().setDraw(drawRef.current);

    map.on("load", () => {
      setMap(map);
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full z-0 absolute map-container"
    />
  );
}

export default Map;
