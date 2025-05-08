import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
