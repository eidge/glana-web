import React, { Component } from "react";
import dynamic from "next/dynamic";
import IGCParser from "glana/src/igc/parser";
import FlightComputer from "glana/src/flight_computer/computer";
import AverageVario from "glana/src/flight_computer/calculators/average_vario";
import EngineInUse from "glana/src/flight_computer/calculators/engine_in_use";
import { seconds } from "glana/src/units/duration";
import FlightGroup, {
  synchronizationMethods
} from "glana/src/analysis/flight_group";
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import { SettingsModel } from "../src/components/flight_analysis/settings";
import Modal, { ModalBody } from "../src/components/ui/modal";
import { Router, withRouter } from "next/router";
import BGAFlightLoader from "../src/bga_ladder/flight_loader";
import URLIGCLoader from "../src/url_igc_loader";
import Calculator from "glana/src/flight_computer/calculators/calculator";
import analytics from "../src/analytics";

const FlightAnalysis = dynamic(
  () => import("../src/components/flight_analysis"),
  {
    ssr: false
  }
);

export interface URLFlightLoader {
  canHandle(): boolean;
  loadFlightGroup(): Promise<FlightGroup>;
}

const URL_LOADERS = [BGAFlightLoader, URLIGCLoader];

export const DebugContext = React.createContext({ enabled: true });

interface Props {
  router: Router;
}

interface State {
  flightGroup: FlightGroup | null;
  settings: SettingsModel;
  isLoading: boolean;
}

class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      flightGroup: null,
      settings: this.buildSettings(),
      isLoading: false
    };
  }

  componentDidMount() {
    this.maybeLoadFlightsFromURL();
  }

  componentDidUpdate() {
    this.maybeLoadFlightsFromURL();
  }

  private async maybeLoadFlightsFromURL() {
    if (this.state.flightGroup || this.state.isLoading) return;

    const loaders = URL_LOADERS.map(
      Loader => new Loader(this.props.router.query)
    );

    const loader = loaders.find(loader => loader.canHandle());
    if (!loader) return;

    this.setState({ isLoading: true }, async () => {
      try {
        let flightGroup = await loader.loadFlightGroup();
        this.loadFlightGroup(flightGroup);
      } catch (e) {
        console.error(e);
        await this.props.router.push("/failed_to_load_flight");
      }
    });
  }

  private loadFlightGroup(flightGroup: FlightGroup) {
    analytics.trackEvent("loaded_flights", {
      count: flightGroup.flights.length
    });
    flightGroup.flights.forEach(f => f.analise(this.flightComputer()));
    flightGroup.synchronize(this.state.settings.synchronizationMethod);
    this.setState({ flightGroup, isLoading: false });
  }

  private buildSettings(): SettingsModel {
    return {
      synchronizationMethod: synchronizationMethods.recordingStarted,
      renderFullTracks: false,
      followFlight: true,
      playbackSpeed: 250,
      units: "imperial",
      showAirspace: false
    };
  }

  render() {
    return (
      <>
        <div
          onDragEnter={event => event.preventDefault()}
          onDragOver={event => event.preventDefault()}
          onDrop={event => this.handleDroppedFiles(event)}
        >
          <DebugContext.Provider
            value={{ enabled: !!this.props.router.query.debug }}
          >
            <FlightAnalysis
              openStats={this.shouldOpenStats()}
              settings={this.state.settings}
              updateSettings={(settings: SettingsModel) =>
                this.updateSettings(settings)
              }
              flightGroup={this.state.flightGroup}
            />
          </DebugContext.Provider>

          <Modal
            isOpen={!this.state.flightGroup || this.state.isLoading}
            onClose={() => {}}
          >
            <ModalBody>
              {this.state.isLoading
                ? this.loadingModal()
                : this.flightUploadModal()}
            </ModalBody>
          </Modal>
        </div>
      </>
    );
  }

  private shouldOpenStats() {
    // router.query.openStats is undefined on first render, so we need
    // to access the lower level blocks to decide whether or not the param was
    // originally passed in.
    const path = this.props.router.asPath;
    const queryString = path.split("/").reverse()[0];
    const queryParams = new URLSearchParams(queryString);
    return queryParams.get("openStats") === "true";
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
                onChange={e => this.handleFileInput(e)}
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
        this.parseIGCs(fileContents);
      } catch (e) {
        console.error(e);
        this.setState({ isLoading: false });
      }
    });
  }

  private parseIGCs(fileContents: string[]) {
    let savedFlights = fileContents.map(contents => {
      let parser = new IGCParser();
      const flight = parser.parse(contents);
      return flight;
    });

    let flightGroup = new FlightGroup(savedFlights);
    this.loadFlightGroup(flightGroup);
  }

  private readFiles(blobs: Blob[]) {
    let fileContentPromises = blobs.map(file => this.readFile(file as Blob));
    return Promise.all(fileContentPromises);
  }

  private readFile(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = fileContents =>
        resolve(fileContents.target?.result as string);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

  private flightComputer() {
    return new FlightComputer(
      new Map([
        ["averageVario", new AverageVario(seconds(30)) as Calculator],
        ["engineOn", new EngineInUse(0.5) as Calculator]
      ])
    );
  }

  private synchronizeFlightGroup(method: SynchronizationMethod) {
    if (!this.state.flightGroup) return;
    this.state.flightGroup.synchronize(method);
    this.setState({
      flightGroup: Object.create(this.state.flightGroup)
    });
  }
}

export default withRouter(Home);