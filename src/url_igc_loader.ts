import { URLFlightLoader } from "../pages";
import { ParsedUrlQuery } from "querystring";
import FlightGroup from "glana/src/analysis/flight_group";
import IGCParser from "glana/src/igc/parser";

export default class URLIGCLoader implements URLFlightLoader {
  private urls: string[];

  constructor(query: ParsedUrlQuery) {
    this.urls = this.parseQueryString(query);
  }

  private parseQueryString(query: ParsedUrlQuery) {
    if (!query.igcUrl) {
      return [];
    } else if (query.igcUrl instanceof Array) {
      return query.igcUrl.flatMap((url) => url.split(","));
    } else {
      return query.igcUrl.split(",");
    }
  }

  canHandle() {
    return this.urls.length > 0;
  }

  async loadFlightGroup() {
    const igcs = await this.loadIGCs();
    const flights = this.parseIGCs(igcs);
    return new FlightGroup(flights);
  }

  private loadIGCs() {
    let responsePromises = this.urls.map((url) => this.fetchText(url));
    return Promise.all(responsePromises);
  }

  private async fetchText(url: string) {
    let response = await fetch(url);
    return await response.text();
  }

  private parseIGCs(fileContents: string[]) {
    return fileContents.map((contents) => {
      let parser = new IGCParser();
      return parser.parse(contents);
    });
  }
}
