import FlightGroup from "glana/src/analysis/flight_group";
import Position from "glana/src/flight_computer/position";
import Task from "glana/src/flight_computer/tasks/task";
import Line from "glana/src/flight_computer/tasks/turnpoints/segments/line";
import Sector from "glana/src/flight_computer/tasks/turnpoints/segments/sector";
import Turnpoint, {
  TurnpointSegment
} from "glana/src/flight_computer/tasks/turnpoints/turnpoint";
import IGCParser from "glana/src/igc/parser";
import SavedFlight from "glana/src/saved_flight";
import { degrees } from "glana/src/units/angle";
import { kilometers } from "glana/src/units/length";
import errorTracker from "../../error_tracker";
import Loader from "./loader";

const DEFAULT_BGA_BASE_URL = new URL("https://bgaladder.net");

export default class BGALoader implements Loader {
  private flightURLs: string[];

  constructor(query: URLSearchParams) {
    const baseURL = this.parseBaseURL(query);
    this.flightURLs = this.parseFlightURLs(baseURL, query);
  }

  willHandle() {
    return this.flightURLs.length > 0;
  }

  async loadFlightGroup() {
    const flightDetailsResponses = await this.loadFlightDetails();
    const savedFlights = flightDetailsResponses
      .map(response => {
        try {
          return this.parseFlightDetails(response);
        } catch (e) {
          return null;
        }
      })
      .filter(sf => !!sf) as SavedFlight[];

    return new FlightGroup(savedFlights);
  }

  private parseBaseURL(query: URLSearchParams) {
    const bgaBaseUrl = query.getAll("bgaBaseUrl");
    if (bgaBaseUrl.length < 1) {
      return DEFAULT_BGA_BASE_URL.origin;
    }
    return new URL(bgaBaseUrl[0]).origin;
  }

  private parseFlightURLs(baseURL: string, query: URLSearchParams) {
    const bgaIds = query.getAll("bgaID");
    if (bgaIds.length < 1) return [];
    return this.buildFlightURL(baseURL, bgaIds.join(","));
  }

  private buildFlightURL(baseURL: string, bgaIdAttr: string) {
    return bgaIdAttr.split(",").map(id => `${baseURL}/api/flightinfo/${id}`);
  }

  private async loadFlightDetails() {
    let promises = this.flightURLs.map(url => this.fetchJSON(url));
    let jsonResponses = await Promise.all(promises);
    return jsonResponses.filter(r => !!r);
  }

  private async fetchJSON(url: string) {
    try {
      let response = await fetch(url);
      if (response.ok) {
        return response.json();
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

  private parseFlightDetails(json: any) {
    let parser = new IGCParser();
    const flight = parser.parse(json.igcContents);
    return this.enrichFlightData(flight, json);
  }

  private enrichFlightData(flight: SavedFlight, bgaData: any) {
    flight.metadata.registration =
      bgaData?.glider.registration || flight.metadata.registration;
    flight.task = this.parseTask(bgaData);
    return flight;
  }

  private parseTask(bgaData: any) {
    if (!(bgaData.task instanceof Array) || bgaData.task.length < 2) {
      return null;
    }
    const turnpoints = bgaData.task.map((tp: any) => this.createTurnpoint(tp));
    return new Task(turnpoints);
  }

  private createTurnpoint(tp: any) {
    let turnpoint = null;
    if (tp.line) {
      turnpoint = this.createLineTurnpoint(tp);
    } else {
      turnpoint = this.createSectorTurnpoint(tp);
    }
    return turnpoint;
  }

  private createLineTurnpoint(tp: any) {
    const line = new Line(
      new Position(degrees(tp.latitude), degrees(tp.longitude)),
      kilometers(tp.radius1 || tp.radius2).multiply(2)
    );
    return new Turnpoint(tp.code || tp.name, [line]);
  }

  private createSectorTurnpoint(tp: any) {
    const segments: TurnpointSegment[] = [];

    if (tp.radius1) {
      const segment = new Sector(
        new Position(degrees(tp.latitude), degrees(tp.longitude)),
        kilometers(tp.radius1),
        degrees(tp.angle1 * 2)
      );
      segments.push(segment);
    }

    if (tp.radius2) {
      const segment = new Sector(
        new Position(degrees(tp.latitude), degrees(tp.longitude)),
        kilometers(tp.radius2),
        degrees(tp.angle2 * 2)
      );
      segments.push(segment);
    }
    return new Turnpoint(tp.code || tp.name, segments);
  }
}
