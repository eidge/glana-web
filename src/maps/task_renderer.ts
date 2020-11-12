import Task, { TaskTurnpoint } from "glana/src/flight_computer/tasks/task";
import MapRenderer from "./map";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import LineString from "ol/geom/LineString";
import { Fill, Stroke, Style } from "ol/style";
import { positionToOlPoint } from "./utils";
import GeoJSON from "ol/format/GeoJSON";

export default class TaskRenderer {
  private map: MapRenderer;
  private layer: any;
  task: Task | null = null;

  constructor(map: MapRenderer) {
    this.map = map;
  }

  render(task: Task) {
    this.reset();

    let features = this.buildFeatures(task);
    let source = new VectorSource({ features });
    let style = () => this.olStyle();
    let layer = new VectorLayer({
      source,
      style,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });

    this.layer = layer;
    this.map.olMap.addLayer(layer);
    this.task = task;
  }

  reset() {
    if (this.layer) {
      this.map.olMap.removeLayer(this.layer);
      this.task = null;
    }
  }

  private buildFeatures(task: Task) {
    return [...this.buildTurnpoints(task), ...this.buildTrack(task)];
  }

  private buildTurnpoints(task: Task) {
    return task.turnpoints.flatMap((tp) => this.buildFeature(tp));
  }

  private buildFeature(turnpoint: TaskTurnpoint) {
    let format = new GeoJSON();
    let features = format.readFeatures(turnpoint.toGeoJSON());
    features.forEach((f) =>
      f.getGeometry()?.transform("EPSG:4326", "EPSG:3857")
    );
    return features;
  }

  private buildTrack(task: Task) {
    const { Feature } = this.map.ol;
    let points = task.turnpoints.map((tp) => positionToOlPoint(tp.center));
    let track = new LineString(points);
    return [new Feature({ geometry: track })];
  }

  private olStyle() {
    return [
      new Style({
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.4)",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(0, 0, 0, 0.1)",
        }),
      }),
    ];
  }
}
