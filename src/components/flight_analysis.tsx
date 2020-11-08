import { Component } from "react";
import Div100vh from "react-div-100vh";

import FlightGroup from "glana/src/analysis/flight_group";
import Map from "./flight_analysis/map";
import Settings, { SettingsModel } from "./flight_analysis/settings";
import Timeline from "./flight_analysis/timeline";
import Task from "glana/src/flight_computer/tasks/task";
import Button from "./ui/button";
import Modal from "./ui/modal";
import SavedFlight from "glana/src/saved_flight";

interface Props {
  flightGroup: FlightGroup | null;
  task: Task | null;
  settings: SettingsModel;
  updateSettings: (settings: SettingsModel) => void;
}

interface State {
  isSettingsOpen: boolean;
  activeTimestamp: Date | null;
  followFlight: SavedFlight | null;
}

export default class FlightAnalysis extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isSettingsOpen: false,
      activeTimestamp: null,
      followFlight: props.flightGroup?.flights[0] || null,
    };
  }

  componentDidMount() {
    this.maybeSetActiveTimestamp();
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.flightGroup !== this.props.flightGroup) {
      this.setState({ followFlight: null });
    }
    this.maybeSetActiveTimestamp();
  }

  private maybeSetActiveTimestamp() {
    if (this.state.activeTimestamp || !this.props.flightGroup) return;

    let timestamps = this.props.flightGroup.flights.map((f: SavedFlight) =>
      f.getRecordingStoppedAt().getTime()
    );
    let oldestTimestamp = Math.max(...timestamps);

    this.setActiveTimestamp(new Date(oldestTimestamp));
  }

  private setActiveTimestamp(timestamp: Date): void {
    this.setState({ activeTimestamp: new Date(timestamp) });
  }

  render() {
    return (
      <div className="w-screen relative">
        <Div100vh>
          <Map
            flightGroup={this.props.flightGroup}
            task={this.props.task}
            activeTimestamp={this.state.activeTimestamp}
            settings={this.props.settings}
          />

          {this.maybeRenderSettingsModalAndButton()}
          {this.maybeRenderTimeline()}
        </Div100vh>
      </div>
    );
  }

  private closeSettingsModal() {
    this.setState(Object.assign(this.state, { isSettingsOpen: false }));
  }

  private maybeRenderTimeline() {
    if (!this.props.flightGroup || !this.state.activeTimestamp) return null;

    return (
      <Timeline
        flightGroup={this.props.flightGroup}
        activeTimestamp={this.state.activeTimestamp}
        onTimestampChange={(timestamp) => this.setActiveTimestamp(timestamp)}
      />
    );
  }

  private maybeRenderSettingsModalAndButton() {
    if (!this.props.flightGroup || !this.state.activeTimestamp) return null;

    return (
      <div className="absolute right-0 top-0 mr-2 mt-2">
        <Button
          icon="cog"
          size="lg"
          color="white"
          onClick={() => this.openSettingsModal()}
        />

        <Modal
          isOpen={this.state.isSettingsOpen}
          onClose={() => this.closeSettingsModal()}
        >
          <Settings
            settings={this.props.settings}
            onChange={this.props.updateSettings}
          />
        </Modal>
      </div>
    );
  }

  private openSettingsModal() {
    this.setState(Object.assign(this.state, { isSettingsOpen: true }));
  }
}
