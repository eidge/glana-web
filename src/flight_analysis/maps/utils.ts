import { fromLonLat } from "ol/proj";
import Position from "glana/src/flight_computer/position";
import { createEmpty, extend, Extent } from "ol/extent";

export function positionToOlPoint(position: Position) {
  return fromLonLat([position.longitude.value, position.latitude.value]);
}

export function extentUnion(...extents: Extent[]) {
  return extents.reduce(
    (finalExtent, extent) => extend(finalExtent, extent),
    createEmpty()
  );
}
