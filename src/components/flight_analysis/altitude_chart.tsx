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
  constructor(props: Props) {
    super(props);
    this.state = { chartData: this.buildChartData(this.props.flightGroup) };
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.flightGroup !== this.props.flightGroup) {
      this.setState({ chartData: this.buildChartData(this.props.flightGroup) });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.props.flightGroup !== nextProps.flightGroup ||
      this.state.chartData !== nextState.chartData
    );
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
    return (
      <Line
        data={this.state.chartData}
        enableGridX={false}
        enableGridY={false}
        isInteractive={false}
        enableArea={true}
        enableSlices={false}
        enablePoints={false}
        margin={{ top: 10 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        curve="monotoneX"
        colors={this.flightTrackColors()}
      />
    );
  }

  private flightTrackColors() {
    return this.props.flightGroup.flights.map((f) => COLORS.getColorFor(f));
  }
}
