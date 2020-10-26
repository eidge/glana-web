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
  private task: Task;

  constructor(map: MapRenderer, task: Task) {
    this.map = map;
    this.task = task;
  }

  render() {
    let features = this.buildFeatures();
    let source = new VectorSource({ features });
    let style = () => this.olStyle();
    let layer = new VectorLayer({ source, style });
    this.map.olMap.addLayer(layer);
  }

  private buildFeatures() {
    return [...this.buildTurnpoints(), ...this.buildTrack()];
  }

  private buildTurnpoints() {
    return this.task.turnpoints.flatMap((tp) => this.buildFeature(tp));
  }

  private buildFeature(turnpoint: TaskTurnpoint) {
    let format = new GeoJSON();
    let features = format.readFeatures(turnpoint.toGeoJSON());
    features.forEach((f) =>
      f.getGeometry().transform("EPSG:4326", "EPSG:3857")
    );
    return features;
  }

  private buildTrack() {
    const { Feature } = this.map.ol;
    let points = this.task.turnpoints.map((tp) => positionToOlPoint(tp.center));
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
