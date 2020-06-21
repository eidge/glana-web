import { Component, ChangeEvent } from "react";
import IGCParser from "glana/src/igc/parser";
import FlightComputer from "glana/src/flight_computer/computer";
import SpeedCalculator from "glana/src/flight_computer/calculators/gps_speed";
import HeadingCalculator from "glana/src/flight_computer/calculators/heading";
import Calculator from "glana/src/flight_computer/calculators/calculator";
import { analyseIGCTrack } from "glana/src";
import FlightMap from "../src/components/flight_map";
import SavedFlight from "glana/src/saved_flight";

interface Props {}

interface State {
  data?: any;
  flight: SavedFlight | null;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { data: null, flight: null };
  }

  render() {
    return (
      <div
        className="container"
        onDragEnter={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => this.handleDroppedFile(event)}
      >
        <FlightMap flight={this.state.flight} />

        <input type="file" onChange={this.loadIGC.bind(this)} />

        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
        `}</style>

        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    );
  }

  table() {
    if (!this.state.data) {
      return null;
    }

    let rows = this.state.data.map((row: any) => {
      return (
        <tr>
          {Object.values(row).map((cell: any) => (
            <td key={cell[0]}>{cell.toString()}</td>
          ))}
        </tr>
      );
    });

    return (
      <table>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  private handleDroppedFile(event: any) {
    event.preventDefault();

    if (event.dataTransfer.files.length < 1) {
      return;
    }

    this.readFile(event.dataTransfer.files[0]);
  }

  private loadIGC(event: ChangeEvent) {
    let target = event.currentTarget as any;
    let files = target.files;

    if (!files) {
      return;
    }

    this.readFile(files[0]);
  }

  private readFile(file: Blob) {
    let reader = new FileReader();
    reader.onload = this.analyseFlight.bind(this);
    reader.readAsText(file);
  }

  private analyseFlight(event: any) {
    const flight = this.parseIGC(event);
    const flightComputer = new FlightComputer(
      new Map<string, Calculator>([
        ["speed", new SpeedCalculator()],
        ["heading", new HeadingCalculator()],
      ])
    );
    this.setState({ data: analyseIGCTrack(flightComputer, flight), flight });
  }

  private parseIGC(event: any) {
    let parser = new IGCParser();
    return parser.parse(event.target.result as string);
  }
}
