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
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import { SettingsModel } from "../src/components/flight_analysis/settings";

interface Props {}

interface State {
  flightGroup: FlightGroup | null;
  task: Task | null;
  settings: SettingsModel;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      flightGroup: null,
      task: null,
      settings: this.buildSettings(),
    };
  }

  private buildSettings() {
    return {
      synchronizationMethod: synchronizationMethods.realTime,
      renderFullTracks: false,
    };
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
          settings={this.state.settings}
          updateSettings={(settings: SettingsModel) =>
            this.updateSettings(settings)
          }
          flightGroup={this.state.flightGroup}
          task={this.state.task}
        />
      </div>
    );
  }

  private updateSettings(settings: SettingsModel) {
    if (
      this.state.settings.synchronizationMethod !==
      settings.synchronizationMethod
    ) {
      this.synchronizeFlightGroup(settings.synchronizationMethod);
    }

    this.setState({ settings });
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
    flightGroup.synchronize(this.state.settings.synchronizationMethod);

    let task: Task | null =
      flightGroup.flights.find((f: SavedFlight) => f.task)?.task || null;

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

  private synchronizeFlightGroup(method: SynchronizationMethod) {
    if (!this.state.flightGroup) return;
    this.state.flightGroup.synchronize(method);
    this.setState({
      flightGroup: Object.create(this.state.flightGroup),
    });
  }
}
