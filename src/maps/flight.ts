import { Datum } from "glana/src/flight_computer/computer";
import SavedFlight from "glana/src/saved_flight";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Map from "./map";

class TrackColors {
  private COLORS = ["#ff006a", "#006aff", "#06ff00"];
  private index: number;

  constructor() {
    this.index = 0;
  }

  getColor() {
    if (this.index > this.COLORS.length - 1) {
      this.index = 0;
    }
    return this.COLORS[this.index++];
  }
}

let colors = new TrackColors();

export default class Flight {
  private flight: SavedFlight;
  private map: Map;

  constructor(map: Map, flight: SavedFlight) {
    this.map = map;
    this.flight = flight;
  }

  render() {
    let color = colors.getColor();
    let features = this.flightFeatures();
    let source = new VectorSource({ features: features });
    let layer = new VectorLayer({ source, style: () => this.olStyle(color) });
    this.map.ol.addLayer(layer);
  }

  private flightFeatures() {
    let { Feature } = require("ol");
    let points = this.flight
      .getDatums()
      .map((datum: Datum, index: number) => this.fixToPoint(datum, index));
    let line = new LineString(points);
    let flightTrack = new Feature({
      geometry: line,
      name: "flightTrack",
    });
    let positionMarker = new Feature({
      geometry: new Point(this.fixToPoint(this.flight.getDatums()[0])),
      name: "positionMarker",
    });
    return [flightTrack, positionMarker];
  }

  private fixToPoint(datum: Datum, index: number = -1) {
    return fromLonLat([
      datum.position.longitude.value,
      datum.position.latitude.value,
      index,
    ]);
  }

  private olStyle(color: string) {
    return [
      new Style({
        stroke: new Stroke({
          color: color,
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: color,
          }),
        }),
      }),
    ];
  }
}
