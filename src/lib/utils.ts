import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useLayers } from "@/hooks/useLayers";

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

const PALETTE = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
];

/** Pick a color that isn’t already in use. */
export function getUniqueColor(): string {
  const used = new Set(
    useLayers.getState().layers.map(l => l.fillColor as string)
  );

  // 1) try palette
  for (const color of PALETTE) {
    if (!used.has(color)) return color;
  }

  // 2) fallback: random hex until we hit one that’s new
  let random;
  do {
    random = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  } while (used.has(random));

  return random;
}