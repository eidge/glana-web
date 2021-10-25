import { Datum } from "glana/src/flight_computer/computer";
import Position from "glana/src/flight_computer/position";
import mapboxgl from "mapbox-gl";
import { Map, LngLatBounds, GeoJSONSource } from "mapbox-gl";
import ReactDOMServer from "react-dom/server";
import { glider } from "../../ui/components/icon/icons";
import { FlightDatum } from "../store/reducer";
import { Z_INDEX_2, Z_INDEX_3 } from "./renderer";

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
  private marker: mapboxgl.Marker;
  currentPosition: PositionGeoJSON;

  constructor(map: Map, flightDatum: FlightDatum) {
    this.map = map;
    this.flightDatum = flightDatum;
    this.timestamp = flightDatum.flight.getRecordingStartedAt();
    this.sourceId = `source-${this.flightDatum.id}`;
    this.layerId = `layer-${this.flightDatum.id}`;
    this.coordinates = this.buildCoordinates(flightDatum);
    this.geoJSON = this.buildGeoJSON(this.coordinates);
    this.bounds = this.calculateBounds(this.geoJSON);
    this.isActive = true;
    this.shouldRenderFullTracks = true;
    this.currentPosition = this.coordinates[0];
    this.marker = this.buildMarker(this.currentPosition);
  }

  private buildCoordinates(flightDatum: FlightDatum) {
    return flightDatum.flight.datums.map(d =>
      this.positionToGeoJSON(d.position)
    );
  }

  private positionToGeoJSON(position: Position): PositionGeoJSON {
    return [position.longitude.value, position.latitude.value];
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
    return geoJSON.geometry.coordinates.reduce(
      (bounds, coordinate: any) => bounds.extend(coordinate),
      new LngLatBounds()
    );
  }

  initialize() {
    this.marker.addTo(this.map);
    this.map.addSource(this.sourceId, {
      type: "geojson",
      data: this.geoJSON
    });
    this.map.addLayer(
      {
        id: this.layerId,
        source: this.sourceId,
        type: "line",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": ["get", "opacity"]
        }
      },
      this.zIndex
    );
  }

  private buildMarker(position: PositionGeoJSON) {
    const el = document.createElement("div");
    el.innerHTML = this.iconSVGURLEncoded();
    const marker = new mapboxgl.Marker(el);
    marker.setLngLat(position);
    return marker;
  }

  private iconSVGURLEncoded() {
    const size = 42;
    const svg = ReactDOMServer.renderToStaticMarkup(
      glider({ color: this.flightDatum.color, width: size, height: size })
    );
    return svg;
  }

  destroy() {
    this.marker.remove();
    this.map.removeLayer(this.layerId);
    this.map.removeSource(this.sourceId);
  }

  getBounds() {
    return this.bounds;
  }

  setActive(isActive: boolean) {
    this.isActive = isActive;
    this.setSourceOpacity();
    this.setLayerZIndex();
  }

  private setSourceOpacity() {
    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    this.geoJSON.properties.opacity = this.opacity;
    source.setData(this.geoJSON);
  }

  private setLayerZIndex() {
    this.map.moveLayer(this.layerId, this.zIndex);
  }

  setRenderFullTracks(shouldRenderFullTracks: boolean) {
    this.shouldRenderFullTracks = shouldRenderFullTracks;
    this.setTime(this.timestamp);
  }

  private get opacity() {
    return this.isActive ? 1 : 0.4;
  }

  private get zIndex() {
    return this.isActive ? Z_INDEX_3 : Z_INDEX_2;
  }

  setTime(timestamp: Date) {
    const datumIdx = this.flightDatum.flight.datumIndexAt(timestamp);
    const datum = this.flightDatum.flight.datums[datumIdx];
    this.currentPosition = this.positionToGeoJSON(datum.position);

    this.maybeUpdateTrack(datumIdx);
    this.updateMarker(datum);
  }

  private maybeUpdateTrack(datumIdx: number) {
    let coordinates = this.coordinates;

    if (!this.shouldRenderFullTracks) {
      coordinates = this.coordinates.slice(0, datumIdx + 1);
    }

    if (this.geoJSON.geometry.coordinates === coordinates) {
      return;
    }

    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    this.geoJSON.geometry.coordinates = coordinates;
    source.setData(this.geoJSON);
  }

  private updateMarker(datum: Datum) {
    const coordinate = this.positionToGeoJSON(datum.position);
    this.marker.setLngLat(coordinate);
    this.marker.setRotation(datum.heading.value);
  }
}
