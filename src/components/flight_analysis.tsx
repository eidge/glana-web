import { Component } from "react";

import FlightGroup from "glana/src/analysis/flight_group";
import Map from "./flight_analysis/map";
import Settings, { SettingsModel } from "./flight_analysis/settings";
import Timeline from "./flight_analysis/timeline";
import Stats from "./flight_analysis/stats";
import Task from "glana/src/flight_computer/tasks/task";
import Button from "./ui/button";
import ToggleableSplitScreen from "./ui/layout/toggleable_split_screen";
import ButtonGroup from "./ui/button_group";
import Modal, { ModalBody, ModalHeader } from "./ui/modal";
import SavedFlight from "glana/src/saved_flight";
import AnimationTicker from "../animation_ticker";

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
  isAnalysisOpen: boolean;
}

export default class FlightAnalysis extends Component<Props, State> {
  private animationTicker: AnimationTicker;

  constructor(props: Props) {
    super(props);
    this.state = {
      flightGroup: props.flightGroup,
      isSettingsOpen: false,
      activeTimestamp: null,
      isPlaying: false,
      isAnalysisOpen: false,
      ...this.followFlightAndTask(props)
    };
    this.animationTicker = new AnimationTicker((elapsedTime: number) =>
      this.tick(elapsedTime)
    );
  }

  private followFlightAndTask(props: Props) {
    const followFlight = props.flightGroup?.flights[0] || null;
    return {
      followFlight: followFlight,
      task: followFlight?.task || null
    };
  }

  componentDidMount() {
    this.maybeSetActiveTimestamp();
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.flightGroup !== this.props.flightGroup) {
      // flightGroup is stored in state so that we can change
      // flightGroup, followFlight && task atomically.
      //
      // This is required to zoom to fit correctly only when the flight group is
      // changed, but not when a task changes without changing flight group.
      this.setState({
        flightGroup: this.props.flightGroup,
        ...this.followFlightAndTask(this.props)
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
      .map(f => f.getRecordingStoppedAt())
      .sort();
    return timestamps[timestamps.length - 1];
  }

  setActiveTimestamp = (timestamp: Date) => {
    this.setState({ activeTimestamp: new Date(timestamp) });
  };

  render() {
    return (
      <ToggleableSplitScreen
        headerComponent="Stats"
        mainComponent={this.mapComponent()}
        secondaryComponent={this.statsComponent()}
        isDrawerOpen={this.state.isAnalysisOpen}
        onClose={this.toggleStats}
      />
    );
  }

  private mapComponent() {
    return (
      <>
        <Map
          flightGroup={this.state.flightGroup}
          followFlight={this.state.followFlight}
          task={this.state.task}
          activeTimestamp={this.state.activeTimestamp}
          settings={this.props.settings}
        />

        {this.maybeRenderSettingsModalAndButton()}
        {this.maybeRenderTimeline()}
      </>
    );
  }

  private statsComponent() {
    if (!this.state.followFlight || !this.state.flightGroup) return null;
    return (
      <Stats
        settings={this.props.settings}
        followFlight={this.state.followFlight}
        flightGroup={this.state.flightGroup}
        setFollowFlight={this.setFollowFlight}
        onTimestampChange={this.setActiveTimestamp}
      ></Stats>
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
    ) {
      return null;
    }

    return (
      <Timeline
        followFlight={this.state.followFlight}
        setFollowFlight={this.setFollowFlight}
        flightGroup={this.props.flightGroup}
        activeTimestamp={this.state.activeTimestamp}
        onTimestampChange={this.setActiveTimestamp}
        settings={this.props.settings}
      />
    );
  }

  setFollowFlight = (f: SavedFlight) => {
    this.setState({
      followFlight: f,
      task: f.task
    });
  };

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
          <ButtonGroup
            direction="vertical"
            buttons={[
              {
                icon: this.state.isPlaying ? "pause" : "play",
                onClick: this.togglePlaying,
                color: "white",
                size: "lg"
              },
              {
                icon: "chartLine",
                onClick: this.toggleStats,
                isActive: this.state.isAnalysisOpen,
                color: "white",
                size: "lg"
              }
            ]}
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

  togglePlaying = () => {
    if (this.state.isPlaying) {
      this.setState({ isPlaying: false }, () => {
        this.animationTicker.stop();
      });
    } else {
      const timestamp = this.shouldRewind()
        ? this.newestTimestamp()
        : this.state.activeTimestamp;
      this.setState({ isPlaying: true, activeTimestamp: timestamp }, () => {
        this.animationTicker.start();
      });
    }
  };

  toggleStats = () => {
    this.setState(s => ({
      ...s,
      isAnalysisOpen: !s.isAnalysisOpen
    }));
  };

  private tick(elapsedTime: number) {
    if (!this.state.activeTimestamp) return;

    let step = elapsedTime * this.props.settings.playbackSpeed;
    let timestamp = new Date(this.state.activeTimestamp.getTime() + step);
    this.setActiveTimestamp(timestamp);

    if (this.playbackIsDone()) {
      this.setState({ isPlaying: false }, () => {
        this.animationTicker.stop();
      });
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
      .map(f => f.getRecordingStartedAt())
      .sort();
    return timestamps[0];
  }

  private playbackIsDone() {
    return (
      this.state.activeTimestamp &&
      this.state.activeTimestamp > this.oldestTimestamp()
    );
  }
}
