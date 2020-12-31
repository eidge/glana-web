import { Datum } from "glana/src/flight_computer/computer";
import { splitWhen } from "../../utils/arrays";
import { FlightDatum } from "../store/reducer";
import MapRenderer from "./map_renderer";
import { extentUnion, positionToOlPoint } from "./utils";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Point from "ol/geom/Point";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { Extent } from "ol/extent";

type TrackSegment = {
  startIndex: number;
  endIndex: number;
  isEngineOn: boolean;
  positions: number[][];
};

export default class FlightRenderer {
  readonly flightDatum: FlightDatum;
  private mapRenderer: MapRenderer;
  private renderFullTrack: boolean;
  private trackSegments: TrackSegment[];
  private trackSegmentFeatures?: Feature<LineString>[];
  private positionMarkerFeature?: Feature<Point>;
  private traceLayer?: VectorLayer;
  private markerLayer?: VectorLayer;
  private activeTimestamp?: Date;
  private extent: Extent;
  private isActive: boolean;

  constructor(mapRenderer: MapRenderer, flightDatum: FlightDatum) {
    this.mapRenderer = mapRenderer;
    this.flightDatum = flightDatum;
    this.renderFullTrack = false;
    this.trackSegments = this.buildTrackSegments(flightDatum);
    this.extent = this.calculateExtent();
    this.isActive = false;
  }

  private buildTrackSegments(flightDatum: FlightDatum) {
    const flight = flightDatum.flight;
    const datumSlices = splitWhen(
      flight.datums,
      datum => this.isEngineOn(datum),
      {
        includeLastValueInBothGroups: true
      }
    );

    let startIndex = 0;
    return datumSlices.map(datums => {
      const isEngineOn = this.isEngineOn(datums[0]);
      const positions = datums.map((datum: Datum) => this.fixToPoint(datum));
      const endIndex = startIndex + positions.length - 1;
      const segment = {
        startIndex: startIndex,
        endIndex: endIndex,
        positions: positions,
        isEngineOn: isEngineOn
      };

      startIndex = endIndex;

      return segment;
    });
  }

  private isEngineOn(datum: Datum) {
    return datum.calculatedValues.engineOn?.value === 1;
  }

  private fixToPoint(datum: Datum) {
    return [...positionToOlPoint(datum.position), datum.timestamp.getTime()];
  }

  private calculateExtent() {
    const features = this.buildTrackSegmentFeatures();
    const extents = features.map(f => f.getGeometry()!.getExtent());
    return extentUnion(...extents);
  }

  getExtent() {
    return this.extent;
  }

  setRenderFullTrack(renderFullTrack: boolean) {
    this.renderFullTrack = renderFullTrack;
    let timestamp;
    if (this.renderFullTrack) {
      timestamp = this.flightDatum.flight.getRecordingStoppedAt();
    } else {
      timestamp =
        this.activeTimestamp || this.flightDatum.flight.getRecordingStartedAt();
    }
    this.drawFlightTrackUntil(timestamp);
  }

  setActiveTimestamp(timestamp: Date) {
    this.activeTimestamp = timestamp;

    const flight = this.flightDatum.flight;
    let datum = flight.datumAt(timestamp);
    if (!datum) {
      datum = flight.datums[0];
    }

    if (!this.renderFullTrack) {
      this.drawFlightTrackUntil(timestamp);
    }

    this.updateMarkerPosition(datum);
  }

  setActive(isActive: boolean) {
    this.isActive = isActive;
    this.setStyle();
  }

  private setStyle() {
    if (!this.traceLayer || !this.markerLayer) return;

    if (this.isActive) {
      this.markerLayer.setZIndex(4);
      this.traceLayer.setZIndex(2);
      this.traceLayer.setOpacity(1);
    } else {
      this.markerLayer.setZIndex(3);
      this.traceLayer.setZIndex(1);
      this.traceLayer.setOpacity(0.4);
    }
  }

  private drawFlightTrackUntil(timestamp: Date) {
    if (!this.trackSegmentFeatures) return;

    const flight = this.flightDatum.flight;

    let currentDatumIndex: number;

    if (timestamp < flight.getRecordingStartedAt()) {
      currentDatumIndex = 0;
    } else if (timestamp > flight.getRecordingStoppedAt()) {
      currentDatumIndex = flight.datums.length - 1;
    } else {
      currentDatumIndex = flight.datumIndexAt(timestamp)!;
    }

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
          currentDatumIndex - trackSegment.startIndex + 1
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

  render() {
    this.renderTrack();
    this.renderMarker();
    this.setStyle();
  }

  private renderTrack() {
    this.trackSegmentFeatures = this.buildTrackSegmentFeatures();
    let trackSource = new VectorSource({
      features: this.trackSegmentFeatures
    });
    this.traceLayer = new VectorLayer({
      source: trackSource,
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });
    this.mapRenderer.olMap.addLayer(this.traceLayer);
  }

  private buildTrackSegmentFeatures() {
    return this.trackSegments.map(segment => {
      const line = new LineString(segment.positions);
      const feature = new Feature<LineString>({ geometry: line });
      feature.setStyle(this.trackStyle(segment));
      return feature;
    });
  }

  private trackStyle(segment: TrackSegment) {
    const flightColor = this.flightDatum.color;
    const { isEngineOn } = segment;
    const color = isEngineOn ? "#FF0000" : flightColor;
    return [
      new Style({
        stroke: new Stroke({
          color: color,
          width: 2
        })
      })
    ];
  }

  private renderMarker() {
    this.positionMarkerFeature = this.buildPositionMarkerFeature();
    let markerSource = new VectorSource({
      features: [this.positionMarkerFeature]
    });
    this.markerLayer = new VectorLayer({
      source: markerSource,
      style: this.markerStyle(),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });
    this.mapRenderer.olMap.addLayer(this.markerLayer);
  }

  private buildPositionMarkerFeature() {
    return new Feature<Point>({
      geometry: new Point(this.fixToPoint(this.flightDatum.flight.datums[0]))
    });
  }

  private markerStyle() {
    const flightColor = this.flightDatum.color;
    return [
      new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: flightColor
          })
        })
      })
    ];
  }

  destroy() {
    if (this.traceLayer) {
      this.mapRenderer.olMap.removeLayer(this.traceLayer);
    }
    if (this.markerLayer) {
      this.mapRenderer.olMap.removeLayer(this.markerLayer);
    }
  }
}
