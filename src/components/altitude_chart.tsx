import { Component } from "react";
import SavedFlight from "glana/src/saved_flight";
import Fix from "glana/src/flight_computer/fix";
import { ResponsiveLineCanvas as Line } from "@nivo/line";

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
    let fix = this.props.flight.fixes[this.props.activePointIndex];

    if (!fix) return null;

    return (
      <div
        className="crosshair"
        style={{ left: `${this.relativePosition()}%` }}
      >
        <div className="tooltip">
          {fix.updatedAt.toLocaleTimeString()}
          <br />
          {fix.position.altitude.toString()}
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
            color: #ff006a;
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
    let fixes = this.limitNumberOfPoints(flight, MAX_POINTS);
    return [
      {
        id: "altitude",
        data: fixes.map((fix: Fix) => {
          return {
            x: fix.updatedAt.getTime(),
            y: fix.position.altitude.value,
          };
        }),
      },
    ];
  }

  private relativePosition() {
    if (!this.props.activePointIndex) return -100;
    const numberOfPoints = this.props.flight.fixes.length;
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
      relativeDistanceLeft * this.props.flight.fixes.length
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
    let fixes = flight.fixes;

    if (fixes.length > maxPoints) {
      let numberOfSamples = Math.round(fixes.length / maxPoints);
      let sampledFixes: Fix[] = [];
      fixes.forEach((fix: Fix, index) => {
        if (index % numberOfSamples === 0) {
          sampledFixes.push(fix);
        }
      });
      fixes = sampledFixes;
    }

    return fixes;
  }
}
