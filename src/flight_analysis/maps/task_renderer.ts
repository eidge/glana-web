import { FeatureCollection } from "geojson";
import Position from "glana/src/flight_computer/position";
import Task from "glana/src/flight_computer/tasks/task";
import { Map, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Z_INDEX_1 } from "./renderer";

type TaskGeoJSON = GeoJSON.FeatureCollection;
type TrackGeoJSON = GeoJSON.Feature<GeoJSON.LineString>;

export default class TaskRenderer {
  private id;
  private map: Map;
  private sourceOutlineId: string;
  private sourceFillId: string;
  private layerOutlineId: string;
  private layerFillId: string;
  private sectorsGeoJSON: TaskGeoJSON;
  private sectorsAndTrackGeoJSON: TaskGeoJSON;
  private bounds: LngLatBounds;

  constructor(map: Map, task: Task) {
    this.id = this.generateId();
    this.map = map;
    this.sourceOutlineId = `source-outline-${this.id}`;
    this.sourceFillId = `source-fill-${this.id}`;
    this.layerOutlineId = `layer-contour-${this.id}`;
    this.layerFillId = `layer-fill-${this.id}`;
    this.sectorsGeoJSON = this.buildTurnpointsGeoJSON(task, false);
    this.sectorsAndTrackGeoJSON = this.buildTurnpointsGeoJSON(task, true);
    this.bounds = this.calculateBounds(this.sectorsGeoJSON);
  }

  private generateId() {
    return Math.round(Math.random() * 1000000).toString();
  }

  buildTurnpointsGeoJSON(
    task: Task,
    includeTrack: boolean
  ): GeoJSON.FeatureCollection {
    const features = task.turnpoints.map((tp) => tp.toGeoJSON());

    if (includeTrack) {
      features.push(this.buildTrackGeoJSON(task));
    }

    return {
      type: "FeatureCollection",
      features: features,
    };
  }

  private buildTrackGeoJSON(task: Task): TrackGeoJSON {
    const coordinates = task.turnpoints.map((tp) =>
      this.positionToGeoJSON(tp.center)
    );
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
      properties: {},
    };
  }

  private positionToGeoJSON(position: Position) {
    return [position.longitude.value, position.latitude.value];
  }

  getBounds() {
    return this.bounds;
  }

  private calculateBounds(geoJSON: FeatureCollection) {
    const coordinates = geoJSON.features.flatMap((f) => {
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
    this.map.addSource(this.sourceOutlineId, {
      type: "geojson",
      data: this.sectorsAndTrackGeoJSON,
      tolerance: 0,
    });
    this.map.addSource(this.sourceFillId, {
      type: "geojson",
      data: this.sectorsGeoJSON,
      tolerance: 0,
    });

    this.map.addLayer(
      {
        id: this.layerOutlineId,
        source: this.sourceOutlineId,
        type: "line",
        paint: {
          "line-color": "black",
          "line-width": 2,
          "line-opacity": 0.3,
        },
      },
      Z_INDEX_1
    );
    this.map.addLayer(
      {
        id: this.layerFillId,
        source: this.sourceFillId,
        type: "fill",
        paint: {
          "fill-color": "black",
          "fill-opacity": 0.1,
        },
      },
      Z_INDEX_1
    );
  }

  destroy() {
    this.map.removeLayer(this.layerFillId);
    this.map.removeLayer(this.layerOutlineId);
    this.map.removeSource(this.sourceFillId);
    this.map.removeSource(this.sourceOutlineId);
  }
}
