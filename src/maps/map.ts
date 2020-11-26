import { createEmpty, extend } from "ol/extent";
import OlMap from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { positionToOlPoint } from "./utils";
import { defaults as interactionDefaults } from "ol/interaction";
import Position from "glana/src/flight_computer/position";
import TileImage from "ol/source/XYZ";
import { TIMELINE_HEIGHT } from "../components/flight_analysis/timeline";
import { Coordinate } from "ol/coordinate";

const ANIMATION_DURATION = 400;

export default class Map {
  private domElement: HTMLElement;
  private isInitialized = false;
  private airspaceLayer!: TileLayer;
  private padding: { top: number; bottom: number; left: number; right: number };
  private mapClientRect: DOMRect;

  ol = require("ol");
  olMap: OlMap;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.mapClientRect = domElement.getBoundingClientRect();
    this.padding = this.calculatePadding(this.mapClientRect);
    this.olMap = this.buildMap();
  }

  private calculatePadding(clientRect: DOMRect) {
    const aspectRatio = clientRect.width / clientRect.height;
    const paddingX = Math.floor(0.05 * aspectRatio * clientRect.width);
    const paddingY = Math.floor((0.05 / aspectRatio) * clientRect.height);

    return {
      top: paddingY,
      right: paddingX,
      bottom: paddingY + TIMELINE_HEIGHT,
      left: paddingX,
    };
  }

  render(showAirspace: boolean) {
    if (!this.isInitialized) {
      this.olMap.setTarget(this.domElement);
      this.isInitialized = true;
    }

    this.airspaceLayer.setVisible(showAirspace);
  }

  reset() {
    this.getLayers().forEach((layer: any) => {
      this.olMap.removeLayer(layer);
    });
  }

  isVisible(position: Position) {
    let coordinate = positionToOlPoint(position);
    let positionXY = this.olMap.getPixelFromCoordinate(coordinate);
    if (!positionXY) return true;

    return (
      positionXY[0] >= this.mapClientRect.left + this.padding.left &&
      positionXY[1] >= this.mapClientRect.top + this.padding.top &&
      positionXY[0] <= this.mapClientRect.right - this.padding.right &&
      positionXY[1] <= this.mapClientRect.bottom - this.padding.bottom
    );
  }

  centerOn(position: Position) {
    const coordinate = positionToOlPoint(position);
    const offsetCoordinate = this.offsetCenterToAccountForTimelineSize(
      coordinate
    );

    this.olMap.getView().animate({
      center: offsetCoordinate,
      duration: ANIMATION_DURATION,
    });
  }

  private offsetCenterToAccountForTimelineSize(coordinate: Coordinate) {
    const coordinateAtTopOfTimeline = this.olMap.getCoordinateFromPixel([
      0,
      this.mapClientRect.bottom - TIMELINE_HEIGHT,
    ]);
    const coordinateAtBottom = this.olMap.getCoordinateFromPixel([
      0,
      this.mapClientRect.bottom,
    ]);

    const x = coordinate[0];
    const y =
      coordinate[1] +
      (coordinateAtBottom[1] - coordinateAtTopOfTimeline[1]) / 2;

    return [x, y];
  }

  zoomIn(position?: Position) {
    let options = {
      zoom: this.olMap.getView().getZoom()! + 1,
      duration: ANIMATION_DURATION,
    } as any;

    if (position) {
      options.center = positionToOlPoint(position);
    }

    this.olMap.getView().animate(options);
  }

  zoomOut() {
    this.olMap.getView().animate({
      zoom: this.olMap.getView().getZoom()! - 1,
      duration: ANIMATION_DURATION,
    });
  }

  zoomToFit() {
    let renderedExtent = this.allFeaturesExtent();
    if (renderedExtent[0] === Infinity) return;
    this.olMap.getView().fit(renderedExtent, {
      padding: [
        this.padding.top + 5,
        this.padding.right + 5,
        this.padding.bottom + 5,
        this.padding.left + 5,
      ],
      duration: ANIMATION_DURATION,
    });
  }

  private allFeaturesExtent() {
    return this.getLayers().reduce(
      (extent, layer) => extend(extent, layer.getSource().getExtent()),
      createEmpty()
    );
  }

  private getLayers(): any[] {
    return this.olMap
      .getLayers()
      .getArray()
      .filter((layer: any) => !this.isTileLayer(layer));
  }

  private isTileLayer(layer: any) {
    return layer instanceof TileLayer;
  }

  private buildMap() {
    const { View } = this.ol;
    const interactions = interactionDefaults({
      altShiftDragRotate: false,
      pinchRotate: false,
    });

    this.airspaceLayer = this.buildAirspaceLayer();

    return new OlMap({
      controls: [],
      interactions: interactions,
      layers: [this.buildMapLayer(), this.airspaceLayer],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });
  }

  private buildAirspaceLayer() {
    return new TileLayer({
      visible: false,
      preload: Infinity,
      source: new TileImage({
        url:
          "https://{1-2}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{-y}.png",
        projection: "EPSG:900913",
      }),
      opacity: 0.5,
      minZoom: 8,
      maxZoom: 14,
    });
  }

  private buildMapLayer() {
    return new TileLayer({
      preload: Infinity,
      source: new OSM({
        url:
          "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ",
      }),
    });
  }
}
