import { createEmpty, extend } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { positionToOlPoint } from "./utils";
import Point from "ol/geom/Point";
import Position from "glana/src/flight_computer/position";

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

  zoomIn() {
    this.olMap.getView().animate({
      zoom: this.olMap.getView().getZoom() + 1,
      duration: 250,
    });
  }

  zoomOut() {
    this.olMap.getView().animate({
      zoom: this.olMap.getView().getZoom() - 1,
      duration: 250,
    });
  }

  zoomToFit() {
    let renderedExtent = this.allFeaturesExtent();
    if (renderedExtent[0] === Infinity) return;
    this.olMap.getView().fit(renderedExtent, {
      padding: [10, 50, 110, 50],
      duration: 500,
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
    return new Map({
      controls: [],
      layers: [
        new TileLayer({
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

  isVisible(position: Position) {
    let coordinate = positionToOlPoint(position);
    let point = new Point(coordinate);
    //this.olMap.getPixelFromCoordinate(coordinate); this gets me DOM XY
    //coordinates I can use this to center point when 50px away from border!
    return point.intersectsExtent(this.olMap.getView().calculateExtent());
  }

  centerOn(position: Position) {
    let coordinate = positionToOlPoint(position);
    this.olMap.getView().animate({ center: coordinate, duration: 400 });
  }
}
