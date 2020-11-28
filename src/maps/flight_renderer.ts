import { Datum } from "glana/src/flight_computer/computer";
import SavedFlight from "glana/src/saved_flight";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { splitWhen } from "../utils/arrays";
import Map from "./map";
import { TrackColors } from "./track_colors";
import { positionToOlPoint } from "./utils";

export const COLORS = new TrackColors();

type TrackSegment = {
  startIndex: number;
  endIndex: number;
  isEngineOn: boolean;
  positions: number[][];
};

interface Options {
  renderFullTrack?: boolean;
}

export default class FlightRenderer {
  private flight: SavedFlight;
  private map: Map;
  private trackSegments: TrackSegment[];
  private trackSegmentFeatures?: Feature<LineString>[];
  private positionMarkerFeature?: Feature<Point>;
  private renderFullTrack: boolean;

  constructor(map: Map, flight: SavedFlight, options: Options = {}) {
    this.map = map;
    this.flight = flight;
    this.trackSegments = this.buildTrackSegments(flight);
    this.renderFullTrack = options.renderFullTrack || false;
  }

  private buildTrackSegments(flight: SavedFlight) {
    const datumSlices = splitWhen(
      flight.getDatums(),
      (datum) => this.isEngineOn(datum),
      {
        includeLastValueInBothGroups: true,
      }
    );

    let startIndex = 0;
    return datumSlices.map((datums) => {
      const isEngineOn = this.isEngineOn(datums[0]);
      const positions = datums.map((datum: Datum) => this.fixToPoint(datum));
      const endIndex = startIndex + positions.length - 1;
      const segment = {
        startIndex: startIndex,
        endIndex: endIndex,
        positions: positions,
        isEngineOn: isEngineOn,
      };

      startIndex = endIndex;

      return segment;
    });
  }

  private isEngineOn(datum: Datum) {
    return datum.calculatedValues.engineOn?.value === 1;
  }

  render() {
    this.trackSegmentFeatures = this.buildTrackSegmentFeatures();
    this.positionMarkerFeature = this.buildPositionMarkerFeature();
    let source = new VectorSource({
      features: this.trackSegmentFeatures.concat(
        this.positionMarkerFeature as any
      ),
    });

    let color = COLORS.getColorFor(this.flight);
    let layer = new VectorLayer({
      source,
      style: () => this.olStyle(color),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });
    layer.setZIndex(1);
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
    if (!this.trackSegmentFeatures) return;

    let currentDatumIndex = this.flight.datumIndexAt(timestamp);

    this.trackSegmentFeatures.forEach((segment, index) => {
      if (currentDatumIndex === null) return;

      const trackSegment = this.trackSegments[index];
      let positions: number[][];

      if (currentDatumIndex < trackSegment.startIndex) {
        positions = [];
      } else if (currentDatumIndex >= trackSegment.endIndex) {
        positions = trackSegment.positions;
      } else {
        positions = trackSegment.positions.slice(
          0,
          currentDatumIndex - trackSegment.startIndex
        );
      }

      segment.getGeometry()!.setCoordinates(positions);
    });
  }

  private updateMarkerPosition(datum: Datum) {
    if (!this.positionMarkerFeature) return;

    this.positionMarkerFeature
      .getGeometry()!
      .setCoordinates(this.fixToPoint(datum));
  }

  private buildTrackSegmentFeatures() {
    return this.trackSegments.map((segment) => {
      const isEngineOn = segment.isEngineOn;
      const line = new LineString(segment.positions);
      const feature = new Feature<LineString>({ geometry: line });
      feature.setStyle(this.traceStyle(isEngineOn));
      return feature;
    });
  }

  private traceStyle(isEngineOn: boolean) {
    if (!isEngineOn) return;
    return [
      new Style({
        stroke: new Stroke({
          color: "#FF0000",
          width: 2,
        }),
      }),
    ];
  }

  private buildPositionMarkerFeature() {
    return new Feature<Point>({
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
