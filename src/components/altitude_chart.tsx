import { Component } from "react";
import SavedFlight from "glana/src/saved_flight";
import { ResponsiveLineCanvas as Line } from "@nivo/line";
import { Datum } from "glana/src/flight_computer/computer";
import { kilometersPerHour, metersPerSecond } from "glana/src/units/speed";

const MAX_POINTS = 1000;

export class HoverState {
  flightPointIndex: number;

  constructor(flightPointIndex: number) {
    this.flightPointIndex = flightPointIndex;
  }
}

interface Props {
  flight: SavedFlight;
  activePointIndex: number | null;
  onHover?: (hoverState: HoverState) => void;
}

interface State {
  chartData: { id: string; data: { x: number; y: number }[] }[];
}

export default class AltitudeChart extends Component<Props, State> {
  flight!: SavedFlight;

  constructor(props: Props) {
    super(props);
    this.flight = props.flight;
    this.state = { chartData: this.buildChartData(this.flight) };
  }

  render() {
    return (
      <div className="chart-container" onMouseMove={(e) => this.onMouseMove(e)}>
        <Line
          data={this.state.chartData}
          enableGridX={false}
          enableGridY={false}
          isInteractive={false}
          enableArea={true}
          enableSlices="x"
          enablePoints={false}
          margin={{ top: 10 }}
          xFormat={(x) => new Date(x).toLocaleTimeString()}
          yFormat={(y) => `${y}m`}
          curve="monotoneX"
          colors={{ scheme: "category10" }}
        />

        {this.renderTooltip()}

        <style jsx>{`
          .chart-container {
            width: 100%;
            height: 100%;
            position: relative;
          }
        `}</style>
      </div>
    );
  }

  private renderTooltip() {
    if (!this.props.activePointIndex) return null;
    let datum = this.props.flight.datums[this.props.activePointIndex];

    if (!datum) return null;

    return (
      <div
        className="crosshair"
        style={{ left: `${this.relativePosition()}%` }}
      >
        <div className="tooltip">
          {datum.updatedAt.toLocaleTimeString()}
          <br />
          {datum.position.altitude.toString()}
          <br />
          {datum.speed.convertTo(kilometersPerHour).toString()}
          <br />
          {datum.vario.convertTo(metersPerSecond).toString()}
        </div>

        <style jsx>{`
          .crosshair {
            position: absolute;
            height: 100%;
            width: 0;

            bottom: 0;

            border-left: dashed 2px #ff006a;
          }

          .tooltip {
            position: absolute;
            bottom: 100%;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
            color: #ff006a;
            background-color: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    );
  }

  componentDidUpdate() {
    if (this.flight !== this.props.flight) {
      this.flight = this.props.flight;
      this.updateChartData(this.flight);
    }
  }

  private updateChartData(flight: SavedFlight) {
    this.setState(
      Object.assign({}, this.state, {
        chartData: this.buildChartData(flight),
      })
    );
  }

  private buildChartData(flight: SavedFlight) {
    let datums = this.limitNumberOfPoints(flight, MAX_POINTS);
    return [
      {
        id: "altitude",
        data: datums.map((datum: Datum) => {
          return {
            x: datum.updatedAt.getTime(),
            y: datum.position.altitude.value,
          };
        }),
      },
    ];
  }

  private relativePosition() {
    if (!this.props.activePointIndex) return -100;
    const numberOfPoints = this.props.flight.datums.length;
    return (this.props.activePointIndex / numberOfPoints) * 100;
  }

  private onMouseMove(event: any) {
    if (!this.props.onHover) {
      return;
    }
    let hoverState = this.buildHoverState(event);

    if (!hoverState) return;

    this.props.onHover(hoverState);
  }

  private buildHoverState(event: any) {
    let container = this.findContainerElement(event.target);
    let chartRect = container.parentElement.getBoundingClientRect() as ClientRect;
    let relativeDistanceLeft =
      (event.clientX - chartRect.left) / chartRect.width;
    let flightPointIndex = Math.round(
      relativeDistanceLeft * this.props.flight.datums.length
    );

    return new HoverState(flightPointIndex);
  }

  private findContainerElement(element: any): any {
    if (element.classList.contains("chart-container")) {
      return element;
    } else {
      return this.findContainerElement(element.parentElement);
    }
  }

  private limitNumberOfPoints(flight: SavedFlight, maxPoints: number) {
    let datums = flight.datums;

    if (datums.length > maxPoints) {
      let numberOfSamples = Math.round(datums.length / maxPoints);
      let sampledDatums: Datum[] = [];
      datums.forEach((datum: Datum, index) => {
        if (index % numberOfSamples === 0) {
          sampledDatums.push(datum);
        }
      });
      datums = sampledDatums;
    }

    return datums;
  }
}
