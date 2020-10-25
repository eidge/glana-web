import FlightGroup from "glana/src/analysis/flight_group";
import { Component } from "react";
import MapRenderer from "../../maps/map";
import FlightRenderer from "../../maps/flight";

interface Props {
  flightGroup: FlightGroup | null;
  activeTimestamp: Date | null;
}

interface State {}

export default class Map extends Component<Props, State> {
  private el: HTMLDivElement | null = null;
  private mapRenderer!: MapRenderer;
  private currentFlightGroup: FlightGroup | null = null;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.renderMap();
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (this.props.flightGroup === this.currentFlightGroup) return;
    this.mapRenderer.reset();
    this.renderFlights();
    this.mapRenderer.zoomToFit();
    this.currentFlightGroup = this.props.flightGroup;
  }

  private renderMap() {
    if (!this.el) return;
    this.mapRenderer = new MapRenderer(this.el);
    this.mapRenderer.render();
  }

  private renderFlights() {
    if (!this.props.flightGroup) return;
    this.props.flightGroup.flights.forEach((flight) => {
      let flightRenderer = new FlightRenderer(this.mapRenderer, flight);
      flightRenderer.render();
    });
  }

  render() {
    return (
      <div className="map" ref={(el) => (this.el = el)}>
        <style jsx>{`
          .map {
            width: 100%;
            height: 100%;
          }
        `}</style>
      </div>
    );
  }
}
