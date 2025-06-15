import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useLayers } from "@/hooks/useLayers";
import { type Feature } from "geojson"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// with slash (for github.io pages)
// export function getPublicPath(path: string) {
//     return `${import.meta.env.BASE_URL}${path}`
// }

//without slash (for custom domain
export function getPublicPath(p: string) {
  const base = import.meta.env.BASE_URL;    
  return p.startsWith('/') ? base + p.slice(1)   
                           : base + p;
}


// This function checks the existing layer names and appends a number to the name if it already exists
export function getUniqueLayerName(name: string) {
  const names = useLayers.getState().layers.map((layer) => layer.name);
  let uniqueName = name;
  let counter = 1;
  while (names.includes(uniqueName)) {
    uniqueName = `${name} (${counter})`;
    counter++;
  }
  return uniqueName;
}

// predefined color palette for layers
const PALETTE = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
];

// This function returns a unique color from the palette or generates a random color if all colors are used
// It takes an optional array of extra used colors to avoid collisions
export function getUniqueColor(extraUsed: string[] = []): string {
  const used = new Set([
    ...useLayers.getState().layers.map(l => l.fillColor as string),
    ...extraUsed,
  ]);

  for (const c of PALETTE) if (!used.has(c)) return c;

  let rnd: string;
  do {
    rnd = "#" + Math.random().toString(16).slice(2, 8).padStart(6, "0");
  } while (used.has(rnd));
  return rnd;
}
// This function returns the icon path based on the geometry type
export const iconForGeometry = (geom: string): string => {
  switch (geom) {
    case "Point":
    case "MultiPoint":
      return "/icons/point.svg";
    case "LineString":
    case "MultiLineString":
      return "/icons/line.svg";
    default:                       // Polygon, MultiPolygon, etc.
      return "/icons/polygon.svg";
  }
};

export function featureKey(f: Feature, idx: number): string {
  return (
    f.id?.toString() ??
    (f.properties as any)?.id?.toString() ??
    // the index INSIDE THE ORIGINAL FEATURES ARRAY (stringified)
    idx.toString()
  );
}
// This type defines the possible export formats 
export type ExportFormat = "geojson" | "gpx" | "png";