import { Datum } from "glana/src/flight_computer/computer";
import Position from "glana/src/flight_computer/position";
import { degrees } from "glana/src/units/angle";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import { Map, LngLatBounds, GeoJSONSource } from "mapbox-gl";
import ReactDOMServer from "react-dom/server";
import { glider, photo } from "../../ui/components/icon/icons";
import { chunk, splitWhen } from "../../utils/arrays";
import { FlightDatum, Picture } from "../store/models/flight_datum";
import { Z_INDEX_2, Z_INDEX_3 } from "./renderer";

const MAX_SEGMENT_SIZE = 200;

type FlightGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.LineString,
  TrackProperties
>;

type MarkerGeoJSON = GeoJSON.FeatureCollection<GeoJSON.Point>;

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

interface Callbacks {
  onOpenPicture?: (picture: Picture) => void;
}

export default class FlightRenderer {
  private map: Map;
  private sourceId: string;
  private layerId: string;
  private markerSourceId: string;
  private markerLayerId: string;
  private geoJSON: FlightGeoJSON;
  private bounds: LngLatBounds;
  private isActive: boolean;
  private shouldRenderFullTracks: boolean;
  private timestamp: Date;
  private marker: mapboxgl.Marker;
  private markerGeoJSON: MarkerGeoJSON;
  private trackSegments: TrackSegment[];
  private isDestroyed: boolean = false;
  private pictureMarkers: mapboxgl.Marker[] = [];
  private callbacks: Callbacks;

  flightDatum: FlightDatum;
  currentPosition: LngLatLike;

  constructor(map: Map, flightDatum: FlightDatum, callbacks: Callbacks = {}) {
    this.map = map;
    this.flightDatum = flightDatum;
    this.callbacks = callbacks;
    this.timestamp = flightDatum.flight.getRecordingStartedAt();
    this.sourceId = `source-flight-${this.flightDatum.id}`;
    this.layerId = `layer-flight-${this.flightDatum.id}`;
    this.markerSourceId = `source-marker-${this.flightDatum.id}`;
    this.markerLayerId = `layer-marker-${this.flightDatum.id}`;
    this.trackSegments = this.buildTrackSegments(flightDatum);
    this.geoJSON = this.buildGeoJSON(this.trackSegments);
    this.bounds = this.calculateBounds(this.geoJSON);
    this.isActive = true;
    this.shouldRenderFullTracks = true;
    this.currentPosition = this.trackSegments[0].geometry.coordinates[0] as any;
    this.markerGeoJSON = this.buildMarkerGeoJSON(
      flightDatum,
      this.currentPosition
    );
    this.marker = this.buildMarker(this.currentPosition);
  }

  private buildMarkerGeoJSON(
    flightDatum: FlightDatum,
    position: LngLatLike
  ): MarkerGeoJSON {
    const heading =
      flightDatum.flight.datums[0].heading.convertTo(degrees).value;

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: position as any,
          },
          properties: {
            label: flightDatum.label,
            color: flightDatum.color,
            heading,
          },
        },
      ],
    };
  }

  private positionToGeoJSON(position: Position): LngLatLike {
    return [position.longitude.value, position.latitude.value];
  }

  private buildGeoJSON(trackSegments: TrackSegment[]): FlightGeoJSON {
    return {
      type: "FeatureCollection",
      features: trackSegments,
    };
  }

  private buildTrackSegments(flightDatum: FlightDatum): TrackSegment[] {
    const flight = flightDatum.flight;
    let datumSlices = splitWhen(
      flight.datums,
      (datum) => this.isEngineOn(datum),
      {
        includeLastValueInBothGroups: true,
      }
    );

    // Split features so we can update smaller segments rather than one larger
    // one. An even better approach for performance would be to have completely
    // different sources.
    datumSlices = datumSlices.flatMap((ds) =>
      chunk(ds, MAX_SEGMENT_SIZE, { includeLastValueInBothGroups: true })
    );

    let startIndex = 0;
    return datumSlices.map((datums) => {
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
          coordinates: coordinates as any,
        },
        properties: {
          title: this.flightDatum.flight.id,
          opacity: this.opacity,
          trackCoordinates: Array.from(coordinates),
          color,
          startIndex,
          endIndex,
          isEngineOn,
        },
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
    geoJSON.features.forEach((f) => {
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
      data: this.geoJSON,
    });
    this.map.addLayer(
      {
        id: this.layerId,
        source: this.sourceId,
        type: "line",
        paint: {
          "line-color": ["get", "color"],
          "line-opacity": ["get", "opacity"],
          "line-width": 2,
        },
      },
      this.zIndex
    );

    this.map.addSource(this.markerSourceId, {
      type: "geojson",
      data: this.markerGeoJSON,
    });

    this.map.addLayer(
      {
        id: this.markerLayerId,
        source: this.markerSourceId,
        type: "symbol",
        layout: {
          "icon-image": "airport",
          "icon-size": 1.5,
          "icon-rotate": ["get", "heading"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          //"text-field": ["get", "label"],
          //"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          //"text-offset": [1.25, 0],
          //"text-size": 12,
          //"text-anchor": "top",
        },
      },
      this.zIndex
    );

    this.renderPictures();
  }

  private renderPictures() {
    this.flightDatum.pictures.forEach((picture) => {
      const marker = this.buildPictureMarker(picture);
      marker.addTo(this.map);
      this.pictureMarkers.push(marker);
    });
  }

  private buildPictureMarker(picture: Picture) {
    const el = this.buildPictureMarkerDomElement(picture);

    const datum = this.flightDatum.flight.datumAt(picture.takenAt);
    const lngLat = this.positionToGeoJSON(datum.position);
    const headingRadians =
      (datum.heading.convertTo(degrees).value * Math.PI) / 180;
    const xOffset = -Math.cos(headingRadians) * 12;
    const yOffset = -Math.sin(headingRadians) * 12;

    const marker = new mapboxgl.Marker(el, {
      offset: [xOffset, yOffset],
    });
    marker.setLngLat(lngLat);

    return marker;
  }

  private buildPictureMarkerDomElement(picture: Picture) {
    const el = document.createElement("div");
    const size = 64;
    const svg = ReactDOMServer.renderToStaticMarkup(
      photo({ width: size, height: size })
    );
    el.innerHTML = svg;
    el.setAttribute(
      "style",
      `cursor: pointer; color: ${this.flightDatum.color}`
    );
    el.onclick = () => {
      if (!this.callbacks.onOpenPicture) return;
      this.callbacks.onOpenPicture(picture);
    };
    return el;
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
    this.pictureMarkers.forEach((m) => m.remove());
    this.map.removeLayer(this.layerId);
    this.map.removeSource(this.sourceId);
    this.map.removeLayer(this.markerLayerId);
    this.map.removeSource(this.markerSourceId);
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
    this.geoJSON.features.forEach((f) => {
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

    this.updateMarker(datum);
    this.maybeUpdateTrack(datumIdx);
  }

  private maybeUpdateTrack(datumIdx: number) {
    this.geoJSON.features.forEach((trackSegment) => {
      if (trackSegment.geometry.type !== "LineString") return;

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
    // this.marker.setLngLat(coordinate);
    // this.marker.setRotation(datum.heading.value);

    const markerSource = this.map.getSource(
      this.markerSourceId
    ) as GeoJSONSource;
    this.markerGeoJSON.features[0].geometry.coordinates = coordinate as any;
    this.markerGeoJSON.features[0].properties!.heading = datum.heading.value;
    markerSource.setData(this.markerGeoJSON);
  }
}
