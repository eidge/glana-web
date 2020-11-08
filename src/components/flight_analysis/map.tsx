import FlightGroup from "glana/src/analysis/flight_group";
import { Component } from "react";
import MapRenderer from "../../maps/map";
import FlightRenderer from "../../maps/flight_renderer";
import TaskRenderer from "../../maps/task_renderer";
import Task from "glana/src/flight_computer/tasks/task";
import SavedFlight from "glana/src/saved_flight";
import { SettingsModel } from "./settings";
import { ButtonProps, IconKey } from "../ui/button";
import ButtonGroup from "../ui/button_group";

interface Props {
  flightGroup: FlightGroup | null;
  task: Task | null;
  activeTimestamp: Date | null;
  settings: SettingsModel;
  followFlight: SavedFlight | null;
}

interface State {}

export default class Map extends Component<Props, State> {
  private el: HTMLDivElement | null = null;
  private mapRenderer!: MapRenderer;
  private flightRenderers: FlightRenderer[] = [];
  private taskRenderer!: TaskRenderer;

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="w-full h-full">
        <div className="w-full h-full" ref={(el) => (this.el = el)}></div>
        <div className="absolute left-0 top-0 ml-2 mt-2">
          <ButtonGroup buttons={this.mapControlButtons()}></ButtonGroup>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.renderMap();
    this.taskRenderer = new TaskRenderer(this.mapRenderer);
    this.renderNewFlightGroup();
  }

  private renderMap() {
    if (!this.el) return;
    this.mapRenderer = new MapRenderer(this.el);
    this.mapRenderer.render();
  }

  componentDidUpdate(previousProps: Props) {
    if (this.shouldUpdateCurrentFlightGroup(previousProps)) {
      this.maybeRenderTask();
      this.updateFlightMarkers();
      this.maybeCenterFlight(this.props.followFlight);
      return;
    }

    this.renderNewFlightGroup();
  }

  private shouldUpdateCurrentFlightGroup(previousProps: Props) {
    return (
      this.props.flightGroup === previousProps?.flightGroup &&
      this.props.settings === previousProps.settings
    );
  }

  private maybeCenterFlight(flight: SavedFlight | null) {
    if (!flight || !this.shouldFollowFlight()) return;
    let currentDatum = flight.datumAt(this.props.activeTimestamp!);
    if (currentDatum && !this.mapRenderer.isVisible(currentDatum.position)) {
      this.mapRenderer.centerOn(currentDatum.position);
    }
  }

  private shouldFollowFlight() {
    return this.props.settings.followFlight && this.props.activeTimestamp;
  }

  private updateFlightMarkers() {
    this.flightRenderers.forEach((fr) =>
      fr.setActiveTimestamp(this.props.activeTimestamp!)
    );
  }

  private renderNewFlightGroup() {
    this.reset();
    if (!this.props.flightGroup) return;

    this.maybeRenderTask();
    this.renderFlights();
    this.zoomToFit();
  }

  private reset() {
    this.mapRenderer.reset();
    this.taskRenderer = new TaskRenderer(this.mapRenderer);
    this.flightRenderers = [];
  }

  private maybeRenderTask() {
    if (!this.props.task) return;
    if (this.taskRenderer.task === this.props.task) return;
    this.taskRenderer.render(this.props.task);
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

  private mapControlButtons() {
    return [
      this.makeButton("zoomIn", () => this.zoomIn()),
      this.makeButton("search", () => this.zoomToFit()),
      this.makeButton("zoomOut", () => this.zoomOut()),
    ];
  }

  private makeButton(icon: IconKey, onClick: () => void): ButtonProps {
    return {
      icon,
      onClick,
      color: "white",
      size: "lg",
    };
  }

  private zoomIn() {
    this.mapRenderer.zoomIn(this.zoomFocalPoint());
  }

  private zoomFocalPoint() {
    if (!this.props.followFlight) {
      return;
    } else if (this.props.activeTimestamp) {
      return this.props.followFlight.datumAt(this.props.activeTimestamp)
        ?.position;
    } else {
      return this.props.followFlight.getDatums()[0].position;
    }
  }

  private zoomOut() {
    this.mapRenderer.zoomOut();
  }

  private zoomToFit() {
    this.mapRenderer.zoomToFit();
  }
}
