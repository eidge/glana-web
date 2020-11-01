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

interface Options {
  renderFullTrack?: boolean;
}

export default class FlightRenderer {
  private flight: SavedFlight;
  private map: Map;
  private flightTrackFeature: any;
  private positionMarkerFeature: any;
  private renderFullTrack: boolean;

  constructor(map: Map, flight: SavedFlight, options: Options = {}) {
    this.map = map;
    this.flight = flight;
    this.renderFullTrack = options.renderFullTrack || false;
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

    if (!this.renderFullTrack) {
      this.drawFlightTrackUntil(timestamp);
    }
    this.updateMarkerPosition(datum);
  }

  private drawFlightTrackUntil(timestamp: Date) {
    let datums = this.flight
      .getDatums()
      .filter((d) => d.timestamp <= timestamp);
    this.flightTrackFeature
      .getGeometry()
      .setCoordinates(datums.map((d) => this.fixToPoint(d)));
  }

  private updateMarkerPosition(datum: Datum) {
    this.positionMarkerFeature
      .getGeometry()
      .setCoordinates(this.fixToPoint(datum));
  }

  private buildFlightTrackFeature() {
    const { Feature } = this.map.ol;
    let points = this.flight
      .getDatums()
      .map((datum: Datum) => this.fixToPoint(datum));
    let line = new LineString(points);
    let feature = new Feature({ geometry: line });
    return feature;
  }

  private buildPositionMarkerFeature() {
    const { Feature } = this.map.ol;
    return new Feature({
      geometry: new Point(this.fixToPoint(this.flight.getDatums()[0])),
    });
  }

  private fixToPoint(datum: Datum) {
    return [...positionToOlPoint(datum.position), datum.timestamp.getTime()];
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
