import FlightGroup from "glana/src/analysis/flight_group";
import { Component } from "react";
import MapRenderer from "../../maps/map";
import FlightRenderer from "../../maps/flight_renderer";
import TaskRenderer from "../../maps/task_renderer";
import Task from "glana/src/flight_computer/tasks/task";
import SavedFlight from "glana/src/saved_flight";
import { SettingsModel } from "./settings";

interface Props {
  flightGroup: FlightGroup | null;
  task: Task | null;
  activeTimestamp: Date | null;
  settings: SettingsModel;
}

interface State {}

export default class Map extends Component<Props, State> {
  private el: HTMLDivElement | null = null;
  private mapRenderer!: MapRenderer;
  private lastProps: Props | null = null;
  private flightRenderers: FlightRenderer[] = [];
  private followFlight: SavedFlight | null = null;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.renderMap();
    this.componentDidUpdate();
  }

  private renderMap() {
    if (!this.el) return;
    this.mapRenderer = new MapRenderer(this.el);
    this.mapRenderer.render();
  }

  componentDidUpdate() {
    if (this.shouldUpdateCurrentFlightGroup()) {
      this.maybeCenterFlight(this.followFlight);
      this.updateFlightMarkers();
      return;
    }

    this.reset();
    if (!this.props.flightGroup) return;

    this.followFlight = this.props.flightGroup.flights[0];
    this.maybeRenderTask();
    this.renderFlights();
    this.mapRenderer.zoomToFit();
  }

  private shouldUpdateCurrentFlightGroup() {
    return (
      this.props.flightGroup === this.lastProps?.flightGroup &&
      this.props.settings === this.lastProps.settings
    );
  }

  private maybeCenterFlight(flight: SavedFlight | null) {
    if (!flight || !this.props.activeTimestamp) return;
    let currentDatum = flight.datumAt(this.props.activeTimestamp);
    if (currentDatum && !this.mapRenderer.isVisible(currentDatum.position)) {
      this.mapRenderer.centerOn(currentDatum.position);
    }
  }

  private updateFlightMarkers() {
    this.flightRenderers.forEach((fr) =>
      fr.setActiveTimestamp(this.props.activeTimestamp!)
    );
  }

  private reset() {
    this.followFlight = null;
    this.mapRenderer.reset();
    this.flightRenderers = [];
    this.lastProps = this.props;
  }

  private maybeRenderTask() {
    if (!this.props.task) return;
    let task = new TaskRenderer(this.mapRenderer, this.props.task);
    task.render();
  }

  private renderFlights() {
    if (!this.props.flightGroup) return;
    this.flightRenderers = this.props.flightGroup.flights.map((flight) => {
      return new FlightRenderer(this.mapRenderer, flight, {
        renderFullTrack: this.props.settings.renderFullTracks,
      });
    });
    this.flightRenderers.forEach((fr) => {
      fr.render();
      if (this.props.activeTimestamp) {
        fr.setActiveTimestamp(this.props.activeTimestamp);
      }
    });
  }

  render() {
    return (
      <div className="map w-full h-full" ref={(el) => (this.el = el)}></div>
    );
  }
}
