import { Component } from "react";

import FlightGroup from "glana/src/analysis/flight_group";
import Map from "./flight_analysis/map";
import Timeline from "./flight_analysis/timeline";
import Task from "glana/src/flight_computer/tasks/task";

interface Props {
  flightGroup: FlightGroup | null;
  task: Task | null;
}

interface State {
  activeTimestamp: Date | null;
}

export default class FlightAnalysis extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { activeTimestamp: null };
  }

  componentDidMount() {
    this.maybeSetActiveTimestamp();
  }

  componentDidUpdate() {
    this.maybeSetActiveTimestamp();
  }

  private maybeSetActiveTimestamp() {
    if (this.state.activeTimestamp || !this.props.flightGroup) return;

    let firstTimestamps = this.props.flightGroup.flights.map((f) =>
      f.getDatums()[0].timestamp.getTime()
    );
    let firstDatum = Math.min(...firstTimestamps);

    this.setActiveTimestamp(new Date(firstDatum));
  }

  private setActiveTimestamp(timestamp: Date): void {
    this.setState({ activeTimestamp: new Date(timestamp) });
  }

  render() {
    return (
      <div className="container">
        <Map
          flightGroup={this.props.flightGroup}
          task={this.props.task}
          activeTimestamp={this.state.activeTimestamp}
        />

        {this.maybeRenderTimeline()}

        <style jsx>{`
          .container {
            position: relative;
            width: 100vw;
            height: 100vh;
          }
        `}</style>
      </div>
    );
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
}
