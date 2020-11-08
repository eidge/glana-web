import React, { Component } from "react";
import IGCParser from "glana/src/igc/parser";
import FlightComputer from "glana/src/flight_computer/computer";
import AverageVario from "glana/src/flight_computer/calculators/average_vario";
import { seconds } from "glana/src/units/duration";
import FlightAnalysis from "../src/components/flight_analysis";
import FlightGroup, {
  synchronizationMethods,
} from "glana/src/analysis/flight_group";
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import { SettingsModel } from "../src/components/flight_analysis/settings";
import Modal from "../src/components/ui/modal";
import Head from "next/head";

interface Props {}

interface State {
  flightGroup: FlightGroup | null;
  settings: SettingsModel;
  isLoading: boolean;
}

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      flightGroup: null,
      settings: this.buildSettings(),
      isLoading: false,
    };
  }

  private buildSettings() {
    return {
      synchronizationMethod: synchronizationMethods.realTime,
      renderFullTracks: false,
      followFlight: true,
      playbackSpeed: 250,
    };
  }

  render() {
    return (
      <>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        </Head>

        <div
          className="w-screen"
          onDragEnter={(event) => event.preventDefault()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => this.handleDroppedFiles(event)}
        >
          <FlightAnalysis
            settings={this.state.settings}
            updateSettings={(settings: SettingsModel) =>
              this.updateSettings(settings)
            }
            flightGroup={this.state.flightGroup}
          />

          <Modal
            isOpen={!this.state.flightGroup || this.state.isLoading}
            onClose={() => {}}
          >
            {this.state.isLoading
              ? this.loadingModal()
              : this.flightUploadModal()}
          </Modal>
        </div>
      </>
    );
  }

  private flightUploadModal() {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-4">Welcome to Glana</h1>
        <div className="mt-4">
          <span className="text-gray-700">
            Select one or more flights to continue
          </span>
          <div className="mt-2">
            <label className="btn btn--primary btn--md">
              Choose file(s)
              <input
                className="invisible w-0"
                type="file"
                multiple={true}
                onChange={(e) => this.handleFileInput(e)}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  private loadingModal() {
    return <p className="text-xl font-semibold">Loading...</p>;
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

  private handleDroppedFiles(event: any) {
    event.preventDefault();
    let files = Array.from(event.dataTransfer.files) as Blob[];
    if (files.length < 1) return;

    this.readAndAnalyseIgcs(files);
  }

  private handleFileInput(event: any) {
    event.preventDefault();
    let files = Array.from(event.target.files) as Blob[];
    if (files.length < 1) return;

    this.readAndAnalyseIgcs(files);
  }

  private async readAndAnalyseIgcs(files: Blob[]) {
    this.setState({ isLoading: true }, async () => {
      try {
        let fileContents = await this.readFiles(files);
        let savedFlights = fileContents.map((contents) =>
          this.analyseFlight(contents)
        );

        let flightGroup = new FlightGroup(savedFlights);
        flightGroup.synchronize(this.state.settings.synchronizationMethod);

        this.setState({ flightGroup, isLoading: false });
      } catch {
        this.setState({ isLoading: false });
      }
    });
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
