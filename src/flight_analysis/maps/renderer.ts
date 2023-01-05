import Task from "glana/src/flight_computer/tasks/task";
import mapboxgl, { Map, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { isProduction } from "../../utils/environment";
import { FlightDatum, Picture } from "../store/models/flight_datum";
import FlightRenderer from "./flight_renderer";
import { AIRSPACE_LAYERS, AIRSPACE_SOURCE } from "./opeanaip_layers";
import TaskRenderer from "./task_renderer";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ";

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Callbacks {
  onOpenPicture?: (picture: Picture) => void;
}

const OPENAIP_TOKEN = "33c125b3916beb39dc3835be89882a09";
const OPENAIP_HOST = "https://api.tiles.openaip.net";
const DEFAULT_STYLE =
  "mapbox://styles/eidge/ckbtv1rde19ee1iqsvymt93ak?optimize=true";

const EMPTY_STYLE = {
  // No tiles, useful for working offline.
  version: 8,
  layers: [],
  sources: {},
};

export const Z_INDEX_1 = "z-index-1";
export const Z_INDEX_2 = "z-index-2";
export const Z_INDEX_3 = "z-index-3";

export default class Renderer {
  private map?: Map;
  private element: HTMLElement;
  private flightRenderers: Record<string, FlightRenderer>;
  private padding: Padding;
  private activeFlightId?: string;
  private shouldRenderFullTracks = false;
  private taskRenderer: TaskRenderer | null = null;
  private shouldFollowActiveFlight = true;
  private resizeObserver: ResizeObserver;
  private zIndexSourceId = "source-empty";
  private cloudLayerId = "layer-cloud";
  private cloudSourceId = "source-cloud";
  private callbacks: Callbacks;

  constructor(
    element: HTMLElement,
    padding: Padding,
    callbacks: Callbacks = {}
  ) {
    this.element = element;
    this.flightRenderers = {};
    this.padding = padding;
    this.resizeObserver = new ResizeObserver(this.resizeCallback.bind(this));
    this.callbacks = callbacks;
  }

  initialize() {
    this.map = this.buildMap();

    this.resizeObserver.observe(this.element);

    return new Promise((resolve) => {
      this.map!.on("load", () => {
        this.addAirspaceSource(this.map!);
        this.addZLayers(this.map!);
        resolve(this);
      });
    });
  }

  private buildMap() {
    return new Map({
      container: this.element,
      style: this.style(),
      failIfMajorPerformanceCaveat: !isProduction(),
      attributionControl: false,
      logoPosition: "top-right",
      hash: true,
      trackResize: false,
      transformRequest: (url) => {
        if (url.startsWith(OPENAIP_HOST)) {
          return {
            url,
            headers: { "x-openaip-client-id": OPENAIP_TOKEN },
          };
        } else {
          return { url };
        }
      },
    });
  }

  private addZLayers(map: Map) {
    this.addZIndexSource(map);
    this.addZIndexLayer(map, Z_INDEX_1);
    this.addZIndexLayer(map, Z_INDEX_2);
    this.addZIndexLayer(map, Z_INDEX_3);
  }

  private addAirspaceSource(map: Map) {
    map.addSource(AIRSPACE_SOURCE.id, AIRSPACE_SOURCE as any);
  }

  private addZIndexSource(map: Map) {
    map.addSource(this.zIndexSourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }

  private addZIndexLayer(map: Map, layerId: string) {
    map.addLayer({ id: layerId, type: "symbol", source: this.zIndexSourceId });
  }

  private resizeCallback() {
    this.map?.resize();
  }

  private style() {
    if (process.env.noTiles) {
      return EMPTY_STYLE;
    } else {
      return DEFAULT_STYLE;
    }
  }

  destroy() {
    this.resizeObserver.unobserve(this.element);

    const renderers = Object.values(this.flightRenderers);
    renderers.forEach((r) => r.destroy());
    this.flightRenderers = {};

    if (this.taskRenderer) {
      this.taskRenderer.destroy();
      this.taskRenderer = null;
    }
    this.map?.remove();
  }

  get activeFlight() {
    if (!this.activeFlightId) return null;
    return this.flightRenderers[this.activeFlightId] || null;
  }

  zoomIn() {
    if (!this.map) return;

    if (this.activeFlight) {
      this.map.flyTo({
        center: this.activeFlight.currentPosition,
        zoom: this.map.getZoom() + 1,
      });
    } else {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (!this.map) return;

    this.map.zoomOut();
  }

  zoomToFit() {
    if (!this.map) return;

    const bounds = this.renderedBounds();

    if (bounds.isEmpty()) return;
    this.map.fitBounds(bounds, { padding: this.padding });
  }

  private renderedBounds() {
    const renderers = Object.values(this.flightRenderers);
    let bounds = renderers.reduce(
      (bounds, r) => bounds.extend(r.getBounds()),
      new LngLatBounds()
    );

    if (this.taskRenderer) {
      bounds = bounds.extend(this.taskRenderer.getBounds());
    }

    return bounds;
  }

  setCloudVisibility(isVisible: boolean) {
    if (isVisible) {
      this.addCloudLayer();
    } else {
      this.removeCloudLayer();
    }
    console.log(`Set shouldShowCloud=${isVisible}`);
  }

  private addCloudLayer() {
    if (!this.map) return;

    this.map.addSource(this.cloudSourceId, {
      type: "raster",
      tiles: this.cloudTileLayerUrls(),
    });

    this.map.addLayer({
      id: this.cloudLayerId,
      type: "raster",
      source: this.cloudSourceId,
    });

    this.map.moveLayer(this.cloudLayerId, Z_INDEX_1);
  }

  private cloudTileLayerUrls() {
    const dateStr =
      this.cloudLayerTimestamp().toISOString().split(".")[0] + "Z";

    return ["a", "b", "c"].map(
      (server) =>
        `https://gibs-${server}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
    );
  }

  private cloudLayerTimestamp() {
    const takeoffAt = this.activeFlight?.flightDatum.flight.getTakeoffAt(true);
    const cloudTimestamp = takeoffAt || new Date();
    cloudTimestamp.setMinutes(0, 0, 0);
    return cloudTimestamp;
  }

  private removeCloudLayer() {
    if (!this.map) return;
    const layer = this.map.getLayer(this.cloudLayerId);
    if (layer) {
      this.map.removeLayer(this.cloudLayerId);
      this.map.removeSource(this.cloudSourceId);
    }
  }

  setAirspaceVisibility(isVisible: boolean) {
    if (!this.map) return;

    if (isVisible) {
      AIRSPACE_LAYERS.forEach((l: any) => this.map!.addLayer(l));
    } else {
      AIRSPACE_LAYERS.forEach(
        (l) => this.map!.getLayer(l.id) && this.map!.removeLayer(l.id)
      );
    }
    console.log(`Set shouldShowAirspace=${isVisible}`);
  }

  setRenderFullTracks(shouldRenderFullTracks: boolean) {
    this.shouldRenderFullTracks = shouldRenderFullTracks;
    const renderers = Object.values(this.flightRenderers);
    renderers.forEach((r) => r.setRenderFullTracks(shouldRenderFullTracks));
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

    const flightRenderer = new FlightRenderer(
      this.map,
      flightDatum,
      this.callbacks
    );
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
    delete this.flightRenderers[flightDatum.id];

    console.log(`Flight removed id=${flightDatum.id}`);
  }

  setTime(timestamp: Date) {
    if (!this.map) return;

    const renderers = Object.values(this.flightRenderers);
    renderers.forEach((r) => r.setTime(timestamp));

    if (
      this.shouldFollowActiveFlight &&
      this.activeFlight &&
      !this.isVisible(this.activeFlight.currentPosition)
    ) {
      this.map.panTo(this.activeFlight.currentPosition, {
        duration: 200,
        essential: true,
      });
    }
  }

  private isVisible(position: mapboxgl.LngLatLike) {
    if (!this.map) return false;

    const posXY = this.map.project(position);
    const clientRect = this.element.getBoundingClientRect();
    return !(
      posXY.x < this.padding.left ||
      posXY.y < this.padding.top ||
      posXY.x > clientRect.width - this.padding.right ||
      posXY.y > clientRect.height - this.padding.bottom
    );
  }

  setActiveFlight(flight: FlightDatum) {
    this.activeFlightId = flight.id;

    Object.keys(this.flightRenderers).forEach((id) => {
      this.flightRenderers[id]?.setActive(id === this.activeFlightId);
    });

    if (!this.fitsBounds()) {
      this.map?.flyTo({ center: this.activeFlight!.currentPosition });
    }

    console.log(`Set active flight id=${flight.id}`);
  }

  private fitsBounds() {
    if (!this.map) return false;
    const bounds = this.renderedBounds();

    if (bounds.isEmpty()) return true;
    const mapBounds = this.map.getBounds();

    return (
      mapBounds.contains(bounds.getNorthEast()) &&
      mapBounds.contains(bounds.getSouthWest())
    );
  }
}
