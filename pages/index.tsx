import { Component, ChangeEvent } from "react";
import IGCParser from "glana/src/igc/parser";
import FlightMap from "../src/components/flight_map";
import SavedFlight from "glana/src/saved_flight";
import { Datum } from "glana/src/flight_computer/computer";
import { kilometersPerHour, metersPerSecond } from "glana/src/units/speed";

interface Props {}

interface State {
  flight: SavedFlight | null;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { flight: null };
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
    if (!this.state.flight) {
      return null;
    }

    let rows = this.state.flight.datums.map((datum: Datum) => {
      return (
        <tr>
          <td>{datum.updatedAt}</td>
          <td>{datum.position.altitude.toString()}</td>
          <td>{datum.speed.convertTo(kilometersPerHour).toString()}</td>
          <td>{datum.vario.convertTo(metersPerSecond).toString()}</td>
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
    const flight = this.parseIGC(event).analise();
    this.setState({ flight });
  }

  private parseIGC(event: any) {
    let parser = new IGCParser();
    return parser.parse(event.target.result as string);
  }
}
