// This will be the context object for the map
//
// Map
//    # new(element)
//    # onHover({isDragging, coordinate} => void)
//    # setPosition(coordinate)
//    # inViewport(coordinate | geom)
//
// Flight (render, setActiveTimestamp)
// Task (render)
//
// On the component:
// map = new Map(el)
// map.onHover(({isDragging, coordinate} => {
//    if (isDragging) return;
//    index = followedFlightRenderer.closestPointIndexTo(coordinate)
//    datum = followedFlightRenderer.flight.getDatums()[index]
//    setActiveTimestamp(datum.timestamp);
// }))
import { createEmpty, extend } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

export default class Map {
  private domElement: HTMLElement;
  ol: any;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.ol = this.buildMap();
  }

  render() {
    this.ol.setTarget(this.domElement);
  }

  reset() {
    this.getLayers().forEach((layer: any) => {
      this.ol.removeLayer(layer);
    });
  }

  private getLayers(): any[] {
    return this.ol
      .getLayers()
      .getArray()
      .filter((layer: any) => !this.isTileLayer(layer));
  }

  zoomToFit() {
    this.ol.getView().fit(this.allFeaturesExtent(), {
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

  private isTileLayer(layer: any) {
    return layer instanceof TileLayer;
  }

  private buildMap() {
    const { Map, View } = require("ol");
    const { defaults } = require("ol/control");
    return new Map({
      controls: defaults({ attribution: false }),
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
}
