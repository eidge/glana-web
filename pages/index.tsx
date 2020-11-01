import React, { Component } from "react";
import IGCParser from "glana/src/igc/parser";
import FlightComputer from "glana/src/flight_computer/computer";
import AverageVario from "glana/src/flight_computer/calculators/average_vario";
import { seconds } from "glana/src/units/duration";
import FlightAnalysis from "../src/components/flight_analysis";
import FlightGroup, {
  synchronizationMethods,
} from "glana/src/analysis/flight_group";
import SavedFlight from "glana/src/saved_flight";
import Task from "glana/src/flight_computer/tasks/task";

interface Props {}

interface State {
  flightGroup: FlightGroup | null;
  task: Task | null;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { flightGroup: null, task: null };
  }

  render() {
    return (
      <div
        className="w-screen"
        onDragEnter={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => this.handleDroppedFile(event)}
      >
        <FlightAnalysis
          flightGroup={this.state.flightGroup}
          task={this.state.task}
        />
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

    let flightGroup = new FlightGroup(savedFlights);
    flightGroup.synchronize(synchronizationMethods.recordingStarted);

    let task: Task | null = flightGroup.flights.find((f: SavedFlight) => f.task)
      .task;

    this.setState({ flightGroup, task });
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
