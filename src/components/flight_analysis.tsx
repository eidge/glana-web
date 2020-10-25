import { Component } from "react";

import FlightGroup from "glana/src/analysis/flight_group";
import Map from "./flight_analysis/map";

interface Props {
  flightGroup: FlightGroup | null;
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
    this.setState({ activeTimestamp: new Date(firstDatum) });
  }

  render() {
    return (
      <div className="container">
        <Map
          flightGroup={this.props.flightGroup}
          activeTimestamp={this.state.activeTimestamp}
        />

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
}
