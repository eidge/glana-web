import Loader from "./loader";
import FlightGroup from "glana/src/analysis/flight_group";
import IGCParser from "glana/src/igc/parser";
import SavedFlight from "glana/src/saved_flight";
import errorTracker from "../../error_tracker";

export default class IGCLoader implements Loader {
  private urls: string[];

  constructor(query: URLSearchParams) {
    this.urls = this.parseQueryString(query);
  }

  willHandle() {
    return this.urls.length > 0;
  }

  async loadFlightGroup() {
    const igcs = await this.loadIGCs();
    const nonEmptyIgcs = igcs.filter(igc => !!igc) as string[];
    const flights = this.parseIGCs(nonEmptyIgcs);
    return new FlightGroup(flights.filter(f => !!f) as SavedFlight[]);
  }

  private parseQueryString(query: URLSearchParams) {
    const igcURLs = query.getAll("igcUrl");
    if (igcURLs.length < 1) return [];
    return igcURLs.flatMap(url => url.split(","));
  }

  private loadIGCs() {
    let responsePromises = this.urls.map(url => this.fetchText(url));
    return Promise.all(responsePromises);
  }

  private async fetchText(url: string) {
    try {
      let response = await fetch(url);
      if (response.ok) {
        return await response.text();
      } else {
        const errorMsg = `Fetching "${url}" failed with ${response.status} (${response.statusText})`;
        await errorTracker.report(new Error(errorMsg));
        return null;
      }
    } catch (e) {
      await errorTracker.report(e);
      return null;
    }
  }

  private parseIGCs(fileContents: string[]) {
    return fileContents.map(contents => {
      try {
        let parser = new IGCParser();
        return parser.parse(contents);
      } catch (e) {
        errorTracker.report(e);
        return null;
      }
    });
  }
}
