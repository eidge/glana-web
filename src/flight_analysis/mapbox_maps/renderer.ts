import Position from "glana/src/flight_computer/position";
import SavedFlight from "glana/src/saved_flight";
import Task from "glana/src/flight_computer/tasks/task";
import mapboxgl, { Map, GeoJSONSourceRaw } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { isProduction } from "../../utils/environment";
import { FlightDatum } from "../store/reducer";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ";

export default class Renderer {
  private map?: Map;
  private element: HTMLElement;
  private flightRenderers: Record<string, FlightRenderer>;

  constructor(element: HTMLElement) {
    this.element = element;
    this.flightRenderers = {};
  }

  initialize() {
    this.map = new Map({
      container: this.element,
      style: "mapbox://styles/eidge/ckbtv1rde19ee1iqsvymt93ak",
      failIfMajorPerformanceCaveat: !isProduction(),
      attributionControl: false,
      logoPosition: "top-right"
    });

    return new Promise(resolve => {
      this.map!.on("load", () => resolve(this));
    });
  }

  destroy() {
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
    console.log("zoom to fit");
  }

  setDebug(isDebug: boolean) {}
  setCloudVisibility(isVisible: boolean) {}
  setAirspaceVisibility(isVisible: boolean) {}
  setRenderFullTracks(shouldRenderFullTracks: boolean) {}
  setFollowActiveFlight(shouldFollow: boolean) {}

  addTask(task: Task) {}
  removeTask(task: Task) {}

  addFlight(flightDatum: FlightDatum) {
    if (!this.map) throw new Error("Renderer is not initialized.");

    const flightRenderer = new FlightRenderer(this.map, flightDatum);
    flightRenderer.initialize();
    this.flightRenderers[flightDatum.id] = flightRenderer;

    console.log(`Flight added id=${flightDatum.id}`);
  }
  removeFlight(flightDatum: FlightDatum) {
    const flightRenderer = this.flightRenderers[flightDatum.id];
    if (!flightRenderer)
      throw new Error(`Flight (id=${flightDatum.id}) not found.`);
    flightRenderer.destroy();
    console.log(`Flight removed id=${flightDatum.id}`);
  }

  setTime(timestamp: Date) {}
  setActiveFlight(flight: FlightDatum) {}
}

class FlightRenderer {
  private map: Map;
  private flightDatum: FlightDatum;
  private sourceId: string;
  private layerId: string;

  constructor(map: Map, flightDatum: FlightDatum) {
    this.map = map;
    this.flightDatum = flightDatum;
    this.sourceId = `source-${this.flightDatum.id}`;
    this.layerId = `layer-${this.flightDatum.id}`;
  }

  initialize() {
    const geoJson = this.flightGeoJSON();
    this.map.addSource(this.sourceId, geoJson);
    this.map.addLayer({
      id: this.layerId,
      source: this.sourceId,
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": this.flightDatum.color,
        "line-width": 2
      }
    });
  }

  private flightGeoJSON(): GeoJSONSourceRaw {
    const coordinates = this.flightDatum.flight.datums.map(d => [
      d.position.longitude.value,
      d.position.latitude.value
    ]);
    return {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates
        },
        properties: {
          title: this.flightDatum.flight.id,
          color: this.flightDatum.color
        }
      }
    };
  }

  destroy() {
    this.map.removeLayer(this.layerId);
    this.map.removeSource(this.sourceId);
  }
}
