// Variant A – namespace import ---------------------------------------------
import * as jsts from "jsts";
const reader = new jsts.io.GeoJSONReader();
const writer = new jsts.io.GeoJSONWriter();

// Variant B – deep ESM paths ----------------------------------------------
// import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader.js";
// import GeoJSONWriter from "jsts/org/locationtech/jts/io/GeoJSONWriter.js";
// const reader = new GeoJSONReader();
// const writer = new GeoJSONWriter();

import type {
  Feature,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  Geometry,
} from "geojson";

/**
 * Robust fall-back clipper – uses JTS/GEOS overlay.
 * Handles self-intersections, slivers, wild topology, etc.
 */
export function clipLineWithJSTS(
  line: Feature<LineString | MultiLineString>,
  poly: Feature<Polygon | MultiPolygon>,
): Feature<LineString | MultiLineString> | null {
  try {
    // JTS geometries
    const gLine = reader.read(line.geometry as unknown as Geometry);
    const gPoly = reader.read(poly.geometry as unknown as Geometry);

    // Overlay operation (order doesn’t matter for intersection)
    const clipped = gLine.intersection(gPoly);

    if (clipped.isEmpty()) return null;

    // Back to GeoJSON
    const geom = writer.write(clipped) as Geometry;

    return { ...line, geometry: geom };
  } catch (e) {
    console.error("JSTS intersection failed", e);
    return null;
  }
}
