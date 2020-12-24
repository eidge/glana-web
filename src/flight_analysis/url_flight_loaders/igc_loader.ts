import Loader from "./loader";
import FlightGroup from "glana/src/analysis/flight_group";
import IGCParser from "glana/src/igc/parser";

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
    const flights = this.parseIGCs(igcs);
    return new FlightGroup(flights);
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
    let response = await fetch(url);
    return await response.text();
  }

  private parseIGCs(fileContents: string[]) {
    return fileContents.map(contents => {
      let parser = new IGCParser();
      return parser.parse(contents);
    });
  }
}
