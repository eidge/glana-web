import { Datum } from "glana/src/flight_computer/computer";
import Position from "glana/src/flight_computer/position";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import { Map, LngLatBounds, GeoJSONSource } from "mapbox-gl";
import ReactDOMServer from "react-dom/server";
import { glider } from "../../ui/components/icon/icons";
import { chunk, splitWhen } from "../../utils/arrays";
import { FlightDatum } from "../store/models/flight_datum";
import { Z_INDEX_2, Z_INDEX_3 } from "./renderer";

const MAX_SEGMENT_SIZE = 200;

type FlightGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.LineString,
  TrackProperties
>;

type TrackProperties = {
  title: string;
  opacity: number;
  trackCoordinates: LngLatLike[];
  color: string;
  startIndex: number;
  endIndex: number;
  isEngineOn: boolean;
};

type TrackSegment = GeoJSON.Feature<GeoJSON.LineString, TrackProperties>;

export default class FlightRenderer {
  private map: Map;
  private sourceId: string;
  private layerId: string;
  private geoJSON: FlightGeoJSON;
  private bounds: LngLatBounds;
  private isActive: boolean;
  private shouldRenderFullTracks: boolean;
  private timestamp: Date;
  private marker: mapboxgl.Marker;
  private trackSegments: TrackSegment[];
  private isDestroyed: boolean = false;

  flightDatum: FlightDatum;
  currentPosition: LngLatLike;

  constructor(map: Map, flightDatum: FlightDatum) {
    this.map = map;
    this.flightDatum = flightDatum;
    this.timestamp = flightDatum.flight.getRecordingStartedAt();
    this.sourceId = `source-flight-${this.flightDatum.id}`;
    this.layerId = `layer-flight-${this.flightDatum.id}`;
    this.trackSegments = this.buildTrackSegments(flightDatum);
    this.geoJSON = this.buildGeoJSON(this.trackSegments);
    this.bounds = this.calculateBounds(this.geoJSON);
    this.isActive = true;
    this.shouldRenderFullTracks = true;
    this.currentPosition = this.trackSegments[0].geometry.coordinates[0] as any;
    this.marker = this.buildMarker(this.currentPosition);
  }

  private positionToGeoJSON(position: Position): LngLatLike {
    return [position.longitude.value, position.latitude.value];
  }

  private buildGeoJSON(trackSegments: TrackSegment[]): FlightGeoJSON {
    return {
      type: "FeatureCollection",
      features: trackSegments
    };
  }

  private buildTrackSegments(flightDatum: FlightDatum): TrackSegment[] {
    const flight = flightDatum.flight;
    let datumSlices = splitWhen(
      flight.datums,
      datum => this.isEngineOn(datum),
      {
        includeLastValueInBothGroups: true
      }
    );

    // Split features so we can update smaller segments rather than one larger
    // one. An even better approach for performance would be to have completely
    // different sources.
    datumSlices = datumSlices.flatMap(ds =>
      chunk(ds, MAX_SEGMENT_SIZE, { includeLastValueInBothGroups: true })
    );

    let startIndex = 0;
    return datumSlices.map(datums => {
      const isEngineOn = this.isEngineOn(datums[0]);
      const coordinates = datums.map((datum: Datum) =>
        this.positionToGeoJSON(datum.position)
      );
      const endIndex = startIndex + coordinates.length - 1;
      const color = isEngineOn ? "#FF0000" : this.flightDatum.color;
      const segment: TrackSegment = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates as any
        },
        properties: {
          title: this.flightDatum.flight.id,
          opacity: this.opacity,
          trackCoordinates: Array.from(coordinates),
          color,
          startIndex,
          endIndex,
          isEngineOn
        }
      };

      startIndex = endIndex;

      return segment;
    });
  }

  private isEngineOn(datum: Datum) {
    return datum.calculatedValues.engineOn?.value === 1;
  }

  private calculateBounds(geoJSON: FlightGeoJSON) {
    const bounds = new LngLatBounds();
    geoJSON.features.forEach(f => {
      f.geometry.coordinates.forEach((coordinate: any) =>
        bounds.extend(coordinate)
      );
    });
    return bounds;
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

  private buildMarker(position: LngLatLike) {
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
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    this.marker.remove();
    this.map.removeLayer(this.layerId);
    this.map.removeSource(this.sourceId);
  }

  getBounds() {
    return this.bounds;
  }

  setActive(isActive: boolean) {
    if (this.isDestroyed) return;

    this.isActive = isActive;
    this.setSourceOpacity();
    this.setLayerZIndex();
  }

  private setSourceOpacity() {
    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    this.geoJSON.features.forEach(f => {
      f.properties.opacity = this.opacity;
    });
    source && source.setData(this.geoJSON);
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
    if (this.isDestroyed) return;

    const datumIdx = this.flightDatum.flight.datumIndexAt(timestamp);
    const datum = this.flightDatum.flight.datums[datumIdx];
    this.currentPosition = this.positionToGeoJSON(datum.position);

    this.maybeUpdateTrack(datumIdx);
    this.updateMarker(datum);
  }

  private maybeUpdateTrack(datumIdx: number) {
    this.geoJSON.features.forEach(trackSegment => {
      const startIdx = 0;
      let endIdx: number;

      if (
        datumIdx >= trackSegment.properties.endIndex ||
        this.shouldRenderFullTracks
      ) {
        endIdx = trackSegment.properties.trackCoordinates.length;
      } else if (datumIdx < trackSegment.properties.startIndex) {
        endIdx = 0;
      } else {
        endIdx = datumIdx - trackSegment.properties.startIndex + 1;
      }

      if (endIdx - startIdx !== trackSegment.geometry.coordinates.length) {
        // For performance reasons, only update the rendering object if it has actually changed
        const coordinates = trackSegment.properties.trackCoordinates.slice(
          startIdx,
          endIdx
        );
        trackSegment.geometry.coordinates = coordinates as any;
      }
    });

    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    source && source.setData(this.geoJSON);
  }

  private updateMarker(datum: Datum) {
    const coordinate = this.positionToGeoJSON(datum.position);
    this.marker.setLngLat(coordinate);
    this.marker.setRotation(datum.heading.value);
  }
}
