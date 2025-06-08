import { useRef, useEffect } from "react";
//import type { Map as MapboxMap } from 'mapbox-gl'
import mapboxgl from "mapbox-gl";
import { useMapStore, BASE_STYLES } from "@/hooks/useMapstore";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useDrawStore } from "@/hooks/useDrawStore";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const BLANK_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "transparent",
      },
    },
  ],
};

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  //const {setMap} = useLayers()
  const { setMap } = useMapStore();
  //const map = useRef<MapboxMap | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: BASE_STYLES.dark,
      center: [10.4, 63.425],
      zoom: 12,
      preserveDrawingBuffer: true, // for exporting to PNG
    });

    drawRef.current = new MapboxDraw({
      displayControlsDefault: true,
    });

    map.addControl(drawRef.current, "top-left");
    useDrawStore.getState().setDraw(drawRef.current);

    map.on("load", () => {
      setMap(map);
    });

    map.on("draw.create", (e) => {
      console.log(e);
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
