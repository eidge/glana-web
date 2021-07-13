import { Map, LngLatBounds, GeoJSONSource } from "mapbox-gl";
import { FlightDatum } from "../store/reducer";

type FlightGeoJSON = GeoJSON.Feature<
  GeoJSON.LineString,
  NonNullable<GeoJSON.GeoJsonProperties>
>;

type PositionGeoJSON = [number, number];

export default class FlightRenderer {
  private map: Map;
  private flightDatum: FlightDatum;
  private sourceId: string;
  private layerId: string;
  private geoJSON: FlightGeoJSON;
  private bounds: LngLatBounds;
  private coordinates: PositionGeoJSON[];
  private isActive: boolean;
  private shouldRenderFullTracks: boolean;
  private timestamp: Date;
  currentPosition: PositionGeoJSON;

  constructor(map: Map, flightDatum: FlightDatum) {
    this.map = map;
    this.flightDatum = flightDatum;
    this.timestamp = flightDatum.flight.getRecordingStartedAt();
    this.sourceId = `source-${this.flightDatum.id}`;
    this.layerId = `layer-${this.flightDatum.id}`;
    this.coordinates = this.flightDatum.flight.datums.map(d => [
      d.position.longitude.value,
      d.position.latitude.value
    ]);
    this.geoJSON = this.buildGeoJSON(this.coordinates);
    this.bounds = this.calculateBounds(this.geoJSON);
    this.isActive = true;
    this.shouldRenderFullTracks = true;
    this.currentPosition = this.coordinates[0];
  }

  private buildGeoJSON(coordinates: GeoJSON.Position[]): FlightGeoJSON {
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates
      },
      properties: {
        title: this.flightDatum.flight.id,
        color: this.flightDatum.color,
        opacity: this.opacity
      }
    };
  }

  private calculateBounds(geoJSON: FlightGeoJSON) {
    console.log(geoJSON);
    return geoJSON.geometry.coordinates.reduce(
      (bounds, coordinate: any) => bounds.extend(coordinate),
      new LngLatBounds()
    );
  }

  initialize() {
    this.map.addSource(this.sourceId, {
      type: "geojson",
      data: this.geoJSON
    });
    this.map.addLayer({
      id: this.layerId,
      source: this.sourceId,
      type: "line",
      paint: {
        "line-color": ["get", "color"],
        "line-width": 2,
        "line-opacity": ["get", "opacity"]
      }
    });
  }

  getBounds() {
    return this.bounds;
  }

  setActive(isActive: boolean) {
    this.isActive = isActive;
    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    this.geoJSON.properties.opacity = this.opacity;
    source.setData(this.geoJSON);
  }

  setRenderFullTracks(shouldRenderFullTracks: boolean) {
    this.shouldRenderFullTracks = shouldRenderFullTracks;
    this.setTime(this.timestamp);
  }

  private get opacity() {
    return this.isActive ? 1 : 0.4;
  }

  setTime(timestamp: Date) {
    this.timestamp = timestamp;
    let coordinates = this.coordinates;

    if (!this.shouldRenderFullTracks) {
      const idxAt = this.flightDatum.flight.datumIndexAt(timestamp);
      coordinates = this.coordinates.slice(0, idxAt + 1);
    }

    if (this.geoJSON.geometry.coordinates === coordinates) {
      return;
    }

    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    this.currentPosition = coordinates[coordinates.length - 1];
    this.geoJSON.geometry.coordinates = coordinates;
    source.setData(this.geoJSON);
  }

  destroy() {
    this.map.removeLayer(this.layerId);
    this.map.removeSource(this.sourceId);
  }
}
