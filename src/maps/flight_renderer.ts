import { Datum } from "glana/src/flight_computer/computer";
import SavedFlight from "glana/src/saved_flight";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Map from "./map";
import { TrackColors } from "./track_colors";
import { positionToOlPoint } from "./utils";

export const COLORS = new TrackColors();

export default class FlightRenderer {
  private flight: SavedFlight;
  private map: Map;
  private flightTrackFeature: any;
  private positionMarkerFeature: any;

  constructor(map: Map, flight: SavedFlight) {
    this.map = map;
    this.flight = flight;
  }

  render() {
    this.flightTrackFeature = this.buildFlightTrackFeature();
    this.positionMarkerFeature = this.buildPositionMarkerFeature();
    let source = new VectorSource({
      features: [this.flightTrackFeature, this.positionMarkerFeature],
    });

    let color = COLORS.getColorFor(this.flight);
    let layer = new VectorLayer({ source, style: () => this.olStyle(color) });
    this.map.olMap.addLayer(layer);
  }

  setActiveTimestamp(timestamp: Date) {
    let datum = this.flight.datumAt(timestamp);
    if (!datum) {
      datum = this.flight.getDatums()[0];
    }
    this.positionMarkerFeature
      .getGeometry()
      .setCoordinates(this.fixToPoint(datum));
  }

  private buildFlightTrackFeature() {
    const { Feature } = this.map.ol;
    let points = this.flight
      .getDatums()
      .map((datum: Datum, index: number) => this.fixToPoint(datum, index));
    let line = new LineString(points);
    return new Feature({ geometry: line });
  }

  private buildPositionMarkerFeature() {
    const { Feature } = this.map.ol;
    return new Feature({
      geometry: new Point(this.fixToPoint(this.flight.getDatums()[0])),
    });
  }

  private fixToPoint(datum: Datum, index: number = -1) {
    return [...positionToOlPoint(datum.position), index];
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
