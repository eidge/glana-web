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
import { Icon, Stroke, Style } from "ol/style";
import { Extent } from "ol/extent";
import ReactDOMServer from "react-dom/server";
import { glider } from "../../ui/components/icon/icons";

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
  private layer?: VectorLayer;
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
    this.setZIndex();
  }

  private setStyle() {
    if (!this.layer) return;
    const style = (this.layer.getStyle() as Style[])[0];
    style.getStroke().setColor(this.traceColor());
  }

  private setZIndex() {
    if (!this.layer) return;

    if (this.isActive) {
      this.layer.setZIndex(2);
    } else {
      this.layer.setZIndex(1);
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
    if (!this.positionMarkerFeature || !this.layer) return;

    this.positionMarkerFeature
      .getGeometry()!
      .setCoordinates(this.fixToPoint(datum));

    const style = (this.layer.getStyle() as Style[])[0];
    style.getImage().setRotation((datum.heading.value * Math.PI) / 180);
  }

  render() {
    this.trackSegmentFeatures = this.buildTrackSegmentFeatures();
    this.positionMarkerFeature = this.buildPositionMarkerFeature();
    let source = new VectorSource({
      features: this.trackSegmentFeatures.concat(
        this.positionMarkerFeature as any
      )
    });

    this.layer = new VectorLayer({
      source,
      style: this.olStyle(),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });
    this.setZIndex();
    this.mapRenderer.olMap.addLayer(this.layer);
  }

  destroy() {
    if (!this.layer) return;
    this.mapRenderer.olMap.removeLayer(this.layer);
  }

  private buildTrackSegmentFeatures() {
    return this.trackSegments.map(segment => {
      const isEngineOn = segment.isEngineOn;
      const line = new LineString(segment.positions);
      const feature = new Feature<LineString>({ geometry: line });
      if (isEngineOn) {
        feature.setStyle(this.engineOnStyle(isEngineOn));
      }
      return feature;
    });
  }

  private engineOnStyle(isEngineOn: boolean) {
    if (!isEngineOn) return;
    const color = "#FF0000";
    return [
      new Style({
        stroke: new Stroke({
          color: color,
          width: 2
        })
      })
    ];
  }

  private buildPositionMarkerFeature() {
    return new Feature<Point>({
      geometry: new Point(this.fixToPoint(this.flightDatum.flight.datums[0]))
    });
  }

  private olStyle() {
    return [
      new Style({
        stroke: new Stroke({
          color: this.traceColor(),
          width: 2
        }),
        image: new Icon({
          src: this.iconSVGURLEncoded(),
          scale: 1
        })
      })
    ];
  }

  private traceColor() {
    const flightColor = this.flightDatum.color;
    return this.isActive ? flightColor : `${flightColor}66`;
  }

  private iconSVGURLEncoded() {
    const size = 42;
    const svg = ReactDOMServer.renderToStaticMarkup(
      glider({ color: this.flightDatum.color, width: size, height: size })
    );
    const encodedSVG = encodeURIComponent(svg);
    return `data:image/svg+xml;utf8,${encodedSVG}`;
  }
}
