import Task, { TaskTurnpoint } from "glana/src/flight_computer/tasks/task";
import MapRenderer from "./map_renderer";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import LineString from "ol/geom/LineString";
import { Fill, Stroke, Style } from "ol/style";
import { extentUnion, positionToOlPoint } from "./utils";
import GeoJSON from "ol/format/GeoJSON";
import { Feature } from "ol";
import { Extent } from "ol/extent";

export default class TaskRenderer {
  private map: MapRenderer;
  private layer: any;
  private task: Task;
  private extent: Extent;

  constructor(map: MapRenderer, task: Task) {
    this.map = map;
    this.task = task;
    this.extent = this.calculateExtent();
  }

  private calculateExtent() {
    let features = this.buildFeatures(this.task);
    const extents = features.map(f => f.getGeometry()!.getExtent());
    return extentUnion(...extents);
  }

  getExtent() {
    return this.extent;
  }

  render() {
    let features = this.buildFeatures(this.task);
    let source = new VectorSource({ features });
    let style = () => this.olStyle();
    let layer = new VectorLayer({
      source,
      style,
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    this.layer = layer;
    this.map.olMap.addLayer(layer);
  }

  destroy() {
    if (this.layer) {
      this.map.olMap.removeLayer(this.layer);
    }
  }

  private buildFeatures(task: Task) {
    return [...this.buildTurnpoints(task), ...this.buildTrack(task)];
  }

  private buildTurnpoints(task: Task) {
    return task.turnpoints.flatMap(tp => this.buildFeature(tp));
  }

  private buildFeature(turnpoint: TaskTurnpoint) {
    let format = new GeoJSON();
    let features = format.readFeatures(turnpoint.toGeoJSON());
    features.forEach(f => f.getGeometry()?.transform("EPSG:4326", "EPSG:3857"));
    return features;
  }

  private buildTrack(task: Task) {
    let points = task.turnpoints.map(tp => positionToOlPoint(tp.center));
    let track = new LineString(points);
    return [new Feature({ geometry: track })];
  }

  private olStyle() {
    return [
      new Style({
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.4)",
          width: 2
        }),
        fill: new Fill({
          color: "rgba(0, 0, 0, 0.1)"
        })
      })
    ];
  }
}
