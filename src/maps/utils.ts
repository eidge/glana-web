import { fromLonLat } from "ol/proj";
import Position from "glana/src/flight_computer/position";

export function positionToOlPoint(position: Position) {
  return fromLonLat([position.longitude.value, position.latitude.value]);
}
