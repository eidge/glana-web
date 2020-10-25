import React, { Component } from "react";
import IGCParser from "glana/src/igc/parser";
import FlightComputer from "glana/src/flight_computer/computer";
import AverageVario from "glana/src/flight_computer/calculators/average_vario";
import { seconds } from "glana/src/units/duration";
import FlightAnalysis from "../src/components/flight_analysis";
import FlightGroup from "glana/src/analysis/flight_group";

interface Props {}

interface State {
  flightGroup: FlightGroup | null;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { flightGroup: null };
  }

  render() {
    return (
      <div
        className="container"
        onDragEnter={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => this.handleDroppedFile(event)}
      >
        <FlightAnalysis flightGroup={this.state.flightGroup} />

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

  private async handleDroppedFile(event: any) {
    event.preventDefault();

    let files = Array.from(event.dataTransfer.files) as Blob[];
    if (files.length < 1) return;

    let fileContents = await this.readFiles(files);
    let savedFlights = fileContents.map((contents) =>
      this.analyseFlight(contents)
    );

    this.setState({ flightGroup: new FlightGroup(savedFlights) });
  }

  private readFiles(blobs: Blob[]) {
    let fileContentPromises = blobs.map((file) => this.readFile(file as Blob));
    return Promise.all(fileContentPromises);
  }

  private readFile(file: Blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (fileContents) => resolve(fileContents);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  private analyseFlight(event: any) {
    const flight = this.parseIGC(event).analise(this.flightComputer());
    return flight;
  }

  private flightComputer() {
    return new FlightComputer(
      new Map([["averageVario", new AverageVario(seconds(30))]])
    );
  }

  private parseIGC(event: any) {
    let parser = new IGCParser();
    return parser.parse(event.target.result as string);
  }
}
