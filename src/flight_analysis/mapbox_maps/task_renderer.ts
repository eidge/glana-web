import { FeatureCollection } from "geojson";
import Position from "glana/src/flight_computer/position";
import Task from "glana/src/flight_computer/tasks/task";
import { Map, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default class TaskRenderer {
  private id;
  private map: Map;
  private sourceId: string;
  private layerContourId: string;
  private layerFillId: string;
  private geoJSON: GeoJSON.FeatureCollection;
  private bounds: LngLatBounds;

  constructor(map: Map, task: Task) {
    this.id = this.generateId();
    this.map = map;
    this.sourceId = `source-${this.id}`;
    this.layerContourId = `layer-contour-${this.id}`;
    this.layerFillId = `layer-fill-${this.id}`;
    this.geoJSON = this.buildGeoJSON(task);
    this.bounds = this.calculateBounds(this.geoJSON);
  }

  private generateId() {
    return Math.round(Math.random() * 1000000).toString();
  }

  buildGeoJSON(task: Task): GeoJSON.FeatureCollection {
    return {
      type: "FeatureCollection",
      features: task.turnpoints
        .map(tp => tp.toGeoJSON())
        .concat([this.trackGeoJSON(task)])
    };
  }

  private trackGeoJSON(task: Task): GeoJSON.Feature<GeoJSON.LineString> {
    const coordinates = task.turnpoints.map(tp =>
      this.positionToGeoJSON(tp.center)
    );
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates
      },
      properties: {}
    };
  }

  private positionToGeoJSON(position: Position) {
    return [position.longitude.value, position.latitude.value];
  }

  getBounds() {
    return this.bounds;
  }

  private calculateBounds(geoJSON: FeatureCollection) {
    const coordinates = geoJSON.features.flatMap(f => {
      if (f.geometry.type === "Polygon") {
        return f.geometry.coordinates[0];
      } else if (f.geometry.type === "LineString") {
        return f.geometry.coordinates;
      } else {
        return [];
      }
    });
    return coordinates.reduce(
      (bounds, coordinate: any) => bounds.extend(coordinate),
      new LngLatBounds()
    );
  }

  initialize() {
    this.map.addSource(this.sourceId, {
      type: "geojson",
      data: this.geoJSON,
      tolerance: 0
    });
    this.map.addLayer({
      id: this.layerContourId,
      source: this.sourceId,
      type: "line",
      paint: {
        "line-color": "black",
        "line-width": 2,
        "line-opacity": 0.3
      }
    });
    this.map.addLayer({
      id: this.layerFillId,
      source: this.sourceId,
      type: "fill",
      paint: {
        "fill-color": "black",
        "fill-opacity": 0.1
      }
    });
  }

  destroy() {
    this.map.removeLayer(this.layerFillId);
    this.map.removeLayer(this.layerContourId);
    this.map.removeSource(this.sourceId);
  }
}
