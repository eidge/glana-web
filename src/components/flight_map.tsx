import { Component } from "react";

import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import SavedFlight from "glana/src/saved_flight";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import LineString from "ol/geom/LineString";
import { fromLonLat } from "ol/proj";
import AltitudeChart, { HoverState } from "./altitude_chart";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Datum } from "glana/src/flight_computer/computer";

interface Props {
  flight: SavedFlight | null;
}

interface State {
  activePointIndex: number | null;
}

export default class FlightMap extends Component<Props, State> {
  map: any;
  flightLayer: VectorLayer | null = null;
  el: HTMLDivElement | null = null;
  flightSource: any;
  overlayLayer!: VectorLayer;
  flight?: SavedFlight;

  constructor(props: Props) {
    super(props);
    this.state = { activePointIndex: null };
  }

  componentDidMount() {
    this.map = this.buildMap();
    this.map.setTarget(this.el);
    this.map.on(
      "pointermove",
      (event: { dragging: any; originalEvent: any }) => {
        if (event.dragging) {
          return;
        }
        let coordinate = this.map.getEventCoordinate(event.originalEvent);
        this.highlightClosestPoint(coordinate);
      }
    );

    this.componentDidUpdate();
  }

  private highlightClosestPoint(coordinate: any) {
    if (!this.flightSource || !this.props.flight) {
      return;
    }

    let closestFeature = this.flightSource.getClosestFeatureToCoordinate(
      coordinate
    );

    if (closestFeature === null) {
      return;
    }

    let geometry = closestFeature.getGeometry();
    let closestPoint = geometry.getClosestPoint(coordinate);

    let pointIndex = Math.round(closestPoint[2]);
    let datum: Datum = this.props.flight.datums[pointIndex];
    this.setState(
      Object.assign({}, this.state, {
        activePointIndex: pointIndex,
      })
    );
    this.showHighlight(this.flightSource, datum);
  }

  componentDidUpdate() {
    if (this.props.flight === this.flight) return;

    if (this.flightLayer) {
      this.map.removeLayer(this.flightLayer);
      this.flightLayer = null;
      this.flightSource = null;
      this.overlayLayer
        .getSource()
        .getFeatures()
        .forEach((f) => this.overlayLayer.getSource().removeFeature(f));
    }

    if (this.props.flight) {
      this.flight = this.props.flight;
      this.renderFlight(this.props.flight);
    }
  }

  private renderFlight(flight: SavedFlight) {
    let { Feature } = require("ol");

    let points = flight.datums.map((datum: Datum, index: number) =>
      this.fixToPoint(datum, index)
    );
    let line = new LineString(points);
    let feature = new Feature({ geometry: line, name: "flightLine" });
    let source = new VectorSource({ features: [feature] });
    let styleFn = () => {
      return [
        new Style({
          stroke: new Stroke({
            color: "#ff006a",
            width: 2,
          }),
        }),
      ];
    };
    let layer = new VectorLayer({ source, style: styleFn });
    this.flightLayer = layer;
    this.flightSource = source;
    this.map.addLayer(layer);
    this.map.getView().fit(line, { padding: [10, 50, 110, 50], duration: 500 });
  }

  private fixToPoint(datum: Datum, index: number = -1) {
    return fromLonLat([
      datum.position.longitude.value,
      datum.position.latitude.value,
      index,
    ]);
  }

  private buildMap() {
    const { Map, View } = require("ol");
    const { defaults } = require("ol/control");
    const overlay = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: "rgba(255,0,0,0.9)",
          }),
        }),
      }),
    });

    this.overlayLayer = overlay;

    return new Map({
      controls: defaults({ attribution: false }),
      layers: [
        new TileLayer({
          source: new OSM({
            // url: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
            url:
              "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ",
          }),
        }),
        overlay,
      ],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });
  }

  render() {
    return (
      <div className="flight-map">
        <div className="map" ref={(el) => (this.el = el)}></div>
        {this.maybeRenderAltitudeChart()}

        <style jsx>{`
          .flight-map {
            position: relative;
            width: 100vw;
            height: 100vh;
          }

          .map {
            width: 100%;
            height: 100%;
          }
        `}</style>
      </div>
    );
  }

  private maybeRenderAltitudeChart() {
    if (!this.props.flight) {
      return null;
    }

    return (
      <div className="altitude-chart-container">
        <AltitudeChart
          flight={this.props.flight}
          activePointIndex={this.state.activePointIndex}
          onHover={(hoverState) => this.updateActivePosition(hoverState)}
        />
        <style jsx>{`
          .altitude-chart-container {
            position: absolute;
            width: 100%;
            height: 100px;

            bottom: 0;
          }
        `}</style>
      </div>
    );
  }

  private updateActivePosition(hoverState: HoverState) {
    let flight = this.props.flight;

    if (!flight || !this.flightSource) {
      return;
    }

    let datum = flight!.datums[hoverState.flightPointIndex];
    this.setState(
      Object.assign({}, this.state, {
        activePointIndex: hoverState.flightPointIndex,
      })
    );
    this.showHighlight(this.flightSource, datum, true);
  }

  private showHighlight(flightSource: any, datum: Datum, recenter = false) {
    flightSource.forEachFeature((feature: any) => {
      let coordinate = this.fixToPoint(datum);
      let highlight = feature.get("highlight");

      if (highlight) {
        highlight.getGeometry().setCoordinates(coordinate);
      } else {
        highlight = new Feature(new Point(coordinate));
        feature.set("highlight", highlight);
        this.overlayLayer.getSource().addFeature(highlight);
      }

      if (recenter && this.isOutsideViewport(highlight.getGeometry())) {
        this.map.getView().animate({ center: coordinate, duration: 400 });
      }
    });
  }

  private isOutsideViewport(geometry: any) {
    return !geometry.intersectsExtent(this.map.getView().calculateExtent());
  }
}
