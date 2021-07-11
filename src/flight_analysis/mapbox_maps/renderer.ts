import { Feature, LineString, FeatureCollection } from "geojson";
import Task from "glana/src/flight_computer/tasks/task";
import mapboxgl, { Map, LngLatBounds, GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { isProduction } from "../../utils/environment";
import { FlightDatum } from "../store/reducer";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ";

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// TODO: Replace console.log with log method. Log only if isDebug=true

export default class Renderer {
  private map?: Map;
  private element: HTMLElement;
  private flightRenderers: Record<string, FlightRenderer>;
  private padding: Padding;
  private activeFlightId?: string;
  private shouldRenderFullTracks = false;
  private taskRenderer: TaskRenderer | null = null;
  private isDebug = false;
  private shouldFollowActiveFlight = true;
  private shouldShowAirspace = false;
  private shouldShowClouds = false;

  constructor(element: HTMLElement, padding: Padding) {
    this.element = element;
    this.flightRenderers = {};
    this.padding = padding;
  }

  initialize() {
    this.map = new Map({
      container: this.element,
      style: "mapbox://styles/eidge/ckbtv1rde19ee1iqsvymt93ak?optimize=true",
      failIfMajorPerformanceCaveat: !isProduction(),
      attributionControl: false,
      logoPosition: "top-right"
    });

    return new Promise(resolve => {
      this.map!.on("load", () => resolve(this));
    });
  }

  destroy() {
    const renderers = Object.values(this.flightRenderers);
    renderers.forEach(r => r.destroy());
    this.flightRenderers = {};

    if (this.taskRenderer) {
      this.taskRenderer.destroy();
      this.taskRenderer = null;
    }
    this.map?.remove();
  }

  get usableClientRect() {
    return new ClientRect();
  }

  zoomIn() {
    this.map?.zoomIn();
    // ZoomIn on ActiveFlight if present, otherwise just zoomIn
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  zoomToFit() {
    const renderers = Object.values(this.flightRenderers);
    let bounds = renderers.reduce(
      (bounds, r) => bounds.extend(r.getBounds()),
      new LngLatBounds()
    );

    if (this.taskRenderer) {
      bounds = bounds.extend(this.taskRenderer.getBounds());
    }

    this.map?.fitBounds(bounds, { padding: this.padding });
  }

  setDebug(isDebug: boolean) {
    this.isDebug = isDebug;
    console.log(`Set debug=${this.isDebug}`);
  }

  setCloudVisibility(isVisible: boolean) {
    this.shouldShowClouds = isVisible;
    console.log(`Set shouldShowClouds=${this.shouldShowClouds}`);
  }

  setAirspaceVisibility(isVisible: boolean) {
    this.shouldShowAirspace = isVisible;
    console.log(`Set shouldShowAirspace=${this.shouldShowAirspace}`);
  }

  setRenderFullTracks(shouldRenderFullTracks: boolean) {
    this.shouldRenderFullTracks = shouldRenderFullTracks;
    const renderers = Object.values(this.flightRenderers);
    renderers.forEach(r => r.setRenderFullTracks(shouldRenderFullTracks));
  }

  setShouldFollowActiveFlight(shouldFollow: boolean) {
    this.shouldFollowActiveFlight = shouldFollow;
    console.log(
      `Set shouldFollowActiveFlight=${this.shouldFollowActiveFlight}`
    );
  }

  addTask(task: Task) {
    if (!this.map) throw new Error("Renderer is not initialized.");

    console.log(`Added task: "${task.name}"`);
    this.taskRenderer = new TaskRenderer(this.map, task);
    this.taskRenderer.initialize();
  }

  removeTask(task: Task) {
    if (!this.taskRenderer) return;
    this.taskRenderer.destroy();
    this.taskRenderer = null;
    console.log(`Removed task: "${task.name}"`);
  }

  addFlight(flightDatum: FlightDatum) {
    if (!this.map) throw new Error("Renderer is not initialized.");

    const flightRenderer = new FlightRenderer(this.map, flightDatum);
    this.flightRenderers[flightDatum.id] = flightRenderer;
    flightRenderer.initialize();
    flightRenderer.setRenderFullTracks(this.shouldRenderFullTracks);

    if (!this.activeFlightId) {
      this.activeFlightId = flightDatum.id;
      flightRenderer.setActive(true);
    }

    console.log(`Flight added id=${flightDatum.id}`);
  }

  removeFlight(flightDatum: FlightDatum) {
    const flightRenderer = this.flightRenderers[flightDatum.id];
    if (!flightRenderer) return;
    flightRenderer.destroy();

    console.log(`Flight removed id=${flightDatum.id}`);
  }

  setTime(timestamp: Date) {
    const renderers = Object.values(this.flightRenderers);
    renderers.forEach(r => r.setTime(timestamp));
  }

  setActiveFlight(flight: FlightDatum) {
    this.activeFlightId = flight.id;

    Object.keys(this.flightRenderers).forEach(id => {
      this.flightRenderers[id]?.setActive(id === this.activeFlightId);
    });

    console.log(`Set active flight id=${flight.id}`);
  }
}

class FlightRenderer {
  private map: Map;
  private flightDatum: FlightDatum;
  private sourceId: string;
  private layerId: string;
  private geoJSON: GeoJSON.Feature<
    GeoJSON.LineString,
    NonNullable<GeoJSON.GeoJsonProperties>
  >;
  private bounds: LngLatBounds;
  private coordinates: GeoJSON.Position[];
  private isActive: boolean;
  private shouldRenderFullTracks: boolean;
  private timestamp: Date;

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
  }

  private buildGeoJSON(
    coordinates: GeoJSON.Position[]
  ): GeoJSON.Feature<
    GeoJSON.LineString,
    NonNullable<GeoJSON.GeoJsonProperties>
  > {
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

  private calculateBounds(geoJSON: Feature<LineString>) {
    console.log(geoJSON);
    return geoJSON.geometry.coordinates.reduce(
      (bounds, coordinate: any) => bounds.extend(coordinate),
      new LngLatBounds()
    );
  }

  initialize() {
    this.map.addSource(this.sourceId, { type: "geojson", data: this.geoJSON });
    this.map.addLayer({
      id: this.layerId,
      source: this.sourceId,
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
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

    const source = this.map.getSource(this.sourceId) as GeoJSONSource;
    this.geoJSON.geometry.coordinates = coordinates;
    source.setData(this.geoJSON);
  }

  destroy() {
    this.map.removeLayer(this.layerId);
    this.map.removeSource(this.sourceId);
  }
}

class TaskRenderer {
  private id;
  private map: Map;
  private sourceId: string;
  private layerContourId: string;
  private layerFillId: string;
  private geoJSON: GeoJSON.FeatureCollection;
  private bounds: LngLatBounds;

  constructor(map: Map, task: Task) {
    this.id = this.generateId();
    this.map = map;
    this.sourceId = `source-${this.id}`;
    this.layerContourId = `layer-contour-${this.id}`;
    this.layerFillId = `layer-fill-${this.id}`;
    this.geoJSON = this.buildGeoJSON(task);
    this.bounds = this.calculateBounds(this.geoJSON);
  }

  private generateId() {
    return Math.round(Math.random() * 1000000).toString();
  }

  buildGeoJSON(task: Task): GeoJSON.FeatureCollection {
    return {
      type: "FeatureCollection",
      features: task.turnpoints.map(tp => tp.toGeoJSON())
    };
  }

  getBounds() {
    return this.bounds;
  }

  private calculateBounds(geoJSON: FeatureCollection) {
    const coordinates = geoJSON.features.flatMap(f => {
      if (f.geometry.type === "Polygon") {
        return f.geometry.coordinates[0];
      } else if (f.geometry.type === "LineString") {
        return f.geometry.coordinates;
      } else {
        return [];
      }
    });
    return coordinates.reduce(
      (bounds, coordinate: any) => bounds.extend(coordinate),
      new LngLatBounds()
    );
  }

  initialize() {
    this.map.addSource(this.sourceId, {
      type: "geojson",
      data: this.geoJSON,
      tolerance: 0
    });
    this.map.addLayer({
      id: this.layerContourId,
      source: this.sourceId,
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "black",
        "line-width": 2,
        "line-opacity": 0.3
      }
    });
    this.map.addLayer({
      id: this.layerFillId,
      source: this.sourceId,
      type: "fill",
      paint: {
        "fill-color": "black",
        "fill-opacity": 0.1
      }
    });
  }

  destroy() {
    this.map.removeLayer(this.layerFillId);
    this.map.removeLayer(this.layerContourId);
    this.map.removeSource(this.sourceId);
  }
}
