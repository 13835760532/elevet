declare module 'd3-geo' {
  export type GeoProjection = {
    (coordinates: [number, number]): [number, number] | null
    center(center: [number, number]): GeoProjection
    scale(scale: number): GeoProjection
    translate(translate: [number, number]): GeoProjection
  }

  export function geoBounds(value: unknown): [[number, number], [number, number]]
  export function geoMercator(): GeoProjection
}

declare module 'earcut' {
  export default function earcut(
    data: number[],
    holeIndices?: number[],
    dimensions?: number
  ): number[]
}
