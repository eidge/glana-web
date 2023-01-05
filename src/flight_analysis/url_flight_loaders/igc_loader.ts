import Loader from "./loader";
import IGCParser from "glana/src/igc/parser";
import errorTracker from "../../error_tracker";
import { FlightDatum } from "../store/models/flight_datum";

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
    const nonEmptyIgcs = igcs.filter((igc) => !!igc) as string[];
    return this.parseIGCs(nonEmptyIgcs);
  }

  private parseQueryString(query: URLSearchParams) {
    const igcURLs = query.getAll("igcUrl");
    if (igcURLs.length < 1) return [];
    return igcURLs.flatMap((url) => url.split(","));
  }

  private loadIGCs() {
    let responsePromises = this.urls.map((url) => this.fetchText(url));
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
      await errorTracker.report(e as any);
      return null;
    }
  }

  private parseIGCs(fileContents: string[]) {
    return fileContents.map((contents) => {
      try {
        const parser = new IGCParser();
        const flight = parser.parse(contents);
        return new FlightDatum(flight);
      } catch (e) {
        errorTracker.report(e as any);
        return null;
      }
    }) as FlightDatum[];
  }
}
