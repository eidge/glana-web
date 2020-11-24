import FlightGroup from "glana/src/analysis/flight_group";
import Position from "glana/src/flight_computer/position";
import Task from "glana/src/flight_computer/tasks/task";
import Line from "glana/src/flight_computer/tasks/turnpoints/segments/line";
import Sector from "glana/src/flight_computer/tasks/turnpoints/segments/sector";
import Turnpoint, {
  TurnpointSegment,
} from "glana/src/flight_computer/tasks/turnpoints/turnpoint";
import IGCParser from "glana/src/igc/parser";
import SavedFlight from "glana/src/saved_flight";
import { degrees } from "glana/src/units/angle";
import { kilometers } from "glana/src/units/length";
import { ParsedUrlQuery } from "querystring";
import { URLFlightLoader } from "../../pages";

export default class FlightLoader implements URLFlightLoader {
  private flightURLs: string[];

  constructor(query: ParsedUrlQuery) {
    this.flightURLs = this.parseQueryString(query);
  }

  private parseQueryString(query: ParsedUrlQuery) {
    const bgaId = query.bgaID;
    if (!bgaId) return [];
    if (bgaId instanceof Array) {
      return this.buildFlightURL(bgaId.join(","));
    } else {
      return this.buildFlightURL(bgaId);
    }
  }

  private buildFlightURL(bgaIdAttr: string) {
    return bgaIdAttr
      .split(",")
      .map((id) => `https://staging.bgaladder.net/api/flightinfo/${id}`);
  }

  canHandle() {
    return this.flightURLs.length > 0;
  }

  async loadFlightGroup() {
    const flightDetailsResponses = await this.loadFlightDetails();
    const savedFlights = flightDetailsResponses.map((response) =>
      this.parseFlightDetails(response)
    );
    return new FlightGroup(savedFlights);
  }

  private async loadFlightDetails() {
    let promises = this.flightURLs.map((url) => fetch(url));
    let responses = await Promise.all(promises);
    let jsonResponses = responses
      .filter((response) => response.status === 200)
      .map((response) => response.json());
    return Promise.all(jsonResponses);
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
      kilometers(tp.radius1 || tp.radius2)
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