import { Component } from "react";
import { ResponsiveLineCanvas as Line } from "@nivo/line";

import FlightGroup from "glana/src/analysis/flight_group";
import { Datum } from "glana/src/flight_computer/computer";
import { COLORS } from "../../maps/flight_renderer";

const MAX_POINTS = 500;

interface Props {
  flightGroup: FlightGroup;
}

interface State {
  chartData: { id: string; data: { x: number; y: number }[] }[];
}

export default class AltitudeChart extends Component<Props, State> {
  private flightGroup: FlightGroup;

  constructor(props: Props) {
    super(props);
    this.flightGroup = props.flightGroup;
    this.state = { chartData: this.buildChartData(this.props.flightGroup) };
  }

  componentDidUpdate() {
    if (this.flightGroup !== this.props.flightGroup) {
      this.flightGroup = this.props.flightGroup;
      this.setState({ chartData: this.buildChartData(this.props.flightGroup) });
    }
  }

  private buildChartData(flightGroup: FlightGroup) {
    return flightGroup.flights.map((flight, index) => {
      let datums = this.limitNumberOfPoints(flight, MAX_POINTS);
      return {
        id: `altitude-${index}`,
        data: datums.map((datum: Datum) => {
          return {
            x: datum.timestamp.getTime(),
            y: datum.position.altitude.value,
          };
        }),
      };
    });
  }

  private limitNumberOfPoints(flight: any, maxPoints: number) {
    let datums = flight.datums;

    if (datums.length > maxPoints) {
      let numberOfSamples = Math.round(datums.length / maxPoints);
      let sampledDatums: Datum[] = [];
      datums.forEach((datum: Datum, index: number) => {
        if (index % numberOfSamples === 0) {
          sampledDatums.push(datum);
        }
      });
      datums = sampledDatums;
    }

    return datums;
  }

  render() {
    // Nivo slows down when the console is open. Since we're not using anything
    // interactive, we should consider using some static canvas renderer.
    return (
      <Line
        data={this.state.chartData}
        enableGridX={false}
        enableGridY={false}
        isInteractive={false}
        enableArea={true}
        enableSlices="x"
        enablePoints={false}
        margin={{ top: 10 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        xFormat={(x) => new Date(x).toLocaleTimeString()}
        yFormat={(y) => `${y}m`}
        curve="monotoneX"
        colors={this.flightTrackColors()}
      />
    );
  }

  private flightTrackColors() {
    return this.props.flightGroup.flights.map((f) => COLORS.getColorFor(f));
  }
}
