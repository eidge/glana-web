import { Component } from "react";
import { ResponsiveLineCanvas as Line } from "@nivo/line";

import FlightGroup from "glana/src/analysis/flight_group";
import { Datum } from "glana/src/flight_computer/computer";
import { COLORS } from "../../maps/flight_renderer";
import SavedFlight from "glana/src/saved_flight";
import { splitWhen } from "../../utils/arrays";

const MAX_POINTS = 500;

interface Props {
  flightGroup: FlightGroup;
}

interface State {
  chartData: { id: string; data: { x: number; y: number }[]; color: string }[];
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
    return flightGroup.flights.flatMap((flight) => this.flightData(flight));
  }

  private flightData(flight: SavedFlight) {
    let datums = this.limitNumberOfPoints(flight, MAX_POINTS);
    return this.splitFlightByEngineSegments(flight, datums);
  }

  private splitFlightByEngineSegments(flight: SavedFlight, datums: Datum[]) {
    const groups = splitWhen(datums, (datum) => this.isEngineOn(datum), {
      includeLastValueInBothGroups: true,
    });

    return groups.map((group) => {
      const data = group.map((datum) => {
        return {
          x: datum.timestamp.getTime(),
          y: datum.position.altitude.value,
        };
      });

      return {
        id: `altitude-${data[0].x}-${data[data.length - 1].x}`,
        data: data,
        color: this.isEngineOn(group[0]) ? "red" : COLORS.getColorFor(flight),
      };
    });
  }

  private isEngineOn(datum: Datum) {
    return datum.calculatedValues.engineOn?.value === 1;
  }

  private limitNumberOfPoints(flight: SavedFlight, maxPoints: number) {
    let datums = flight.getDatums();

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
    return this.state.chartData.map((data) => data.color);
  }
}
