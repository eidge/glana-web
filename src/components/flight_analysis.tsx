import { Component } from "react";
import Div100vh from "react-div-100vh";

import FlightGroup from "glana/src/analysis/flight_group";
import Map from "./flight_analysis/map";
import Settings, { SettingsModel } from "./flight_analysis/settings";
import Timeline from "./flight_analysis/timeline";
import Task from "glana/src/flight_computer/tasks/task";
import Button from "./ui/button";
import Modal, { ModalBody, ModalHeader } from "./ui/modal";
import SavedFlight from "glana/src/saved_flight";
import BGALadder from "../bga_ladder/api";

interface Props {
  flightGroup: FlightGroup | null;
  settings: SettingsModel;
  updateSettings: (settings: SettingsModel) => void;
}

interface State {
  flightGroup: FlightGroup | null;
  isSettingsOpen: boolean;
  activeTimestamp: Date | null;
  followFlight: SavedFlight | null;
  task: Task | null;
  isPlaying: boolean;
}

export default class FlightAnalysis extends Component<Props, State> {
  private ticker: any = null;
  private bgaLadder: BGALadder;

  constructor(props: Props) {
    super(props);
    this.state = {
      flightGroup: props.flightGroup,
      isSettingsOpen: false,
      activeTimestamp: null,
      isPlaying: false,
      ...this.followFlightAndTask(props),
    };
    this.bgaLadder = new BGALadder();
  }

  private followFlightAndTask(props: Props) {
    const followFlight = props.flightGroup?.flights[0] || null;
    return {
      followFlight: followFlight,
      task: followFlight?.task || null,
    };
  }

  componentDidMount() {
    this.bgaLadder.onTimestampChange((timestamp) =>
      this.setActiveTimestamp(timestamp, false)
    );
    this.maybeSetActiveTimestamp();
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.flightGroup !== this.props.flightGroup) {
      // flightGroup is stored in state so that we can change
      // flightGroup, followFlight && task atomically.
      //
      // This is required to zoom to fit correctly only when the flight group is
      // changed, but not when a task changes without changing task group.
      this.setState({
        flightGroup: this.props.flightGroup,
        ...this.followFlightAndTask(this.props),
      });
    }
    this.maybeSetActiveTimestamp();
  }

  private maybeSetActiveTimestamp() {
    if (this.state.activeTimestamp || !this.props.flightGroup) return;
    this.setActiveTimestamp(this.oldestTimestamp());
  }

  private oldestTimestamp() {
    if (!this.props.flightGroup) return new Date();
    const timestamps = this.props.flightGroup.flights
      .map((f) => f.getRecordingStoppedAt())
      .sort();
    return timestamps[timestamps.length - 1];
  }

  private setActiveTimestamp(timestamp: Date, notify: boolean = true): void {
    this.setState({ activeTimestamp: new Date(timestamp) }, () => {
      notify && this.bgaLadder.setTimestamp(timestamp);
    });
  }

  render() {
    return (
      <div className="w-screen relative">
        <Div100vh>
          <Map
            flightGroup={this.state.flightGroup}
            followFlight={this.state.followFlight}
            task={this.state.task}
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
    if (
      !this.props.flightGroup ||
      !this.state.followFlight ||
      !this.state.activeTimestamp
    )
      return null;

    return (
      <Timeline
        followFlight={this.state.followFlight}
        setFollowFlight={(f: SavedFlight) => this.setFollowFlight(f)}
        flightGroup={this.props.flightGroup}
        activeTimestamp={this.state.activeTimestamp}
        onTimestampChange={(timestamp) => this.setActiveTimestamp(timestamp)}
        settings={this.props.settings}
      />
    );
  }

  private setFollowFlight(f: SavedFlight) {
    this.setState({
      followFlight: f,
      task: f.task,
    });
  }

  private maybeRenderSettingsModalAndButton() {
    if (!this.props.flightGroup || !this.state.activeTimestamp) return null;

    return (
      <div className="absolute right-0 top-0 mr-2 mt-2 flex flex-col">
        <Button
          icon="cog"
          size="lg"
          color="white"
          onClick={() => this.openSettingsModal()}
        />

        <div className="mt-2">
          <Button
            icon={this.state.isPlaying ? "pause" : "play"}
            size="lg"
            color="white"
            onClick={() => this.togglePlaying()}
          />
        </div>

        <Modal
          isOpen={this.state.isSettingsOpen}
          onClose={() => this.closeSettingsModal()}
        >
          <ModalHeader
            title="Settings"
            onClose={() => this.closeSettingsModal()}
          />
          <ModalBody>
            <Settings
              settings={this.props.settings}
              onChange={this.props.updateSettings}
            />
          </ModalBody>
        </Modal>
      </div>
    );
  }

  private openSettingsModal() {
    this.setState(Object.assign(this.state, { isSettingsOpen: true }));
  }

  private togglePlaying() {
    if (this.state.isPlaying) {
      this.setState({ isPlaying: false });
    } else {
      const fps = 20;
      this.ticker = setInterval(() => {
        this.tick((1000 / fps) * this.props.settings.playbackSpeed);
      }, 1000 / fps);
      const timestamp = this.shouldRewind()
        ? this.newestTimestamp()
        : this.state.activeTimestamp;
      this.setState({ isPlaying: true, activeTimestamp: timestamp });
    }
  }

  private shouldRewind() {
    if (!this.state.activeTimestamp) {
      return true;
    }
    return (
      this.state.activeTimestamp.getTime() + 60000 >
      this.oldestTimestamp().getTime()
    );
  }

  private newestTimestamp() {
    if (!this.props.flightGroup) return new Date();
    const timestamps = this.props.flightGroup.flights
      .map((f) => f.getRecordingStartedAt())
      .sort();
    return timestamps[0];
  }

  private tick(incrementInMillis: number) {
    if (!this.state.isPlaying) {
      this.ticker && clearInterval(this.ticker);
      this.ticker = null;
      return;
    }

    if (this.playbackIsDone()) {
      this.setState({ isPlaying: false });
    }

    this.setState((state) => {
      if (!state.activeTimestamp) return state;
      return {
        ...state,
        activeTimestamp: new Date(
          state.activeTimestamp?.getTime() + incrementInMillis
        ),
      };
    });
  }

  private playbackIsDone() {
    return (
      this.state.activeTimestamp &&
      this.state.activeTimestamp > this.oldestTimestamp()
    );
  }
}
