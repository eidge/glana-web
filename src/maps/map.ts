import { createEmpty, extend } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { positionToOlPoint } from "./utils";
import { defaults as interactionDefaults } from "ol/interaction";
import Position from "glana/src/flight_computer/position";

const ANIMATION_DURATION = 400;
const DEFAULT_PADDING = 50;
const TIMELINE_SIZE = 110;

export default class Map {
  private domElement: HTMLElement;
  olMap: any;
  ol = require("ol");

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.olMap = this.buildMap();
  }

  render() {
    this.olMap.setTarget(this.domElement);
  }

  reset() {
    this.getLayers().forEach((layer: any) => {
      this.olMap.removeLayer(layer);
    });
  }

  isVisible(position: Position, paddingInPixels: number = DEFAULT_PADDING) {
    let coordinate = positionToOlPoint(position);
    let positionXY = this.olMap.getPixelFromCoordinate(coordinate);
    if (!positionXY) return true;

    let mapClientRect = this.domElement.getBoundingClientRect();
    return (
      positionXY[0] >= paddingInPixels &&
      positionXY[1] >= paddingInPixels &&
      positionXY[0] < mapClientRect.right - paddingInPixels &&
      positionXY[1] < mapClientRect.bottom - paddingInPixels
    );
  }

  centerOn(position: Position) {
    let coordinate = positionToOlPoint(position);
    this.olMap
      .getView()
      .animate({ center: coordinate, duration: ANIMATION_DURATION });
  }

  zoomIn(position?: Position) {
    let options = {
      zoom: this.olMap.getView().getZoom() + 1,
      duration: ANIMATION_DURATION,
    } as any;

    if (position) {
      options.center = positionToOlPoint(position);
    }

    this.olMap.getView().animate(options);
  }

  zoomOut() {
    this.olMap.getView().animate({
      zoom: this.olMap.getView().getZoom() - 1,
      duration: ANIMATION_DURATION,
    });
  }

  zoomToFit() {
    let renderedExtent = this.allFeaturesExtent();
    if (renderedExtent[0] === Infinity) return;
    this.olMap.getView().fit(renderedExtent, {
      padding: [
        DEFAULT_PADDING,
        DEFAULT_PADDING,
        TIMELINE_SIZE,
        DEFAULT_PADDING,
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
    const { Map, View } = this.ol;
    const interactions = interactionDefaults({
      altShiftDragRotate: false,
      pinchRotate: false,
    });
    return new Map({
      controls: [],
      interactions: interactions,
      layers: [
        new TileLayer({
          preload: Infinity,
          source: new OSM({
            url:
              "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ",
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });
  }
}
