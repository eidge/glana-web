import Task from "glana/src/flight_computer/tasks/task";
import mapboxgl, { Map, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { isProduction } from "../../utils/environment";
import { FlightDatum } from "../store/reducer";
import FlightRenderer from "./flight_renderer";
import TaskRenderer from "./task_renderer";

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
