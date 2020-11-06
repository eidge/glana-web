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
}

interface State {
  followFlight: SavedFlight | null;
}

export default class Map extends Component<Props, State> {
  private el: HTMLDivElement | null = null;
  private mapRenderer!: MapRenderer;
  private lastProps: Props | null = null;
  private flightRenderers: FlightRenderer[] = [];

  constructor(props: Props) {
    super(props);
    this.state = { followFlight: props.flightGroup?.flights[0] || null };
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
      this.maybeCenterFlight(this.state.followFlight);
      this.updateFlightMarkers();
      return;
    }

    this.reset();
    if (!this.props.flightGroup) return;

    this.setState((state, props) => {
      return { ...state, followFlight: props.flightGroup?.flights[0] || null };
    });
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

  private reset() {
    this.setState({ followFlight: null });
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
      <div className="w-full h-full">
        <div className="w-full h-full" ref={(el) => (this.el = el)}></div>
        <div className="absolute left-0 top-0 ml-2 mt-2">
          <ButtonGroup buttons={this.mapControlButtons()}></ButtonGroup>
        </div>
      </div>
    );
  }

  private mapControlButtons() {
    return [
      this.makeButton("zoomIn", () => this.zoomIn()),
      this.makeButton("search", () => this.zoomToFit()),
      this.makeButton("zoomIn", () => this.zoomOut()),
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
    if (!this.state.followFlight) {
      return;
    } else if (this.props.activeTimestamp) {
      return this.state.followFlight.datumAt(this.props.activeTimestamp)
        ?.position;
    } else {
      return this.state.followFlight.getDatums()[0].position;
    }
  }

  private zoomOut() {
    this.mapRenderer.zoomOut();
  }

  private zoomToFit() {
    this.mapRenderer.zoomToFit();
  }
}
