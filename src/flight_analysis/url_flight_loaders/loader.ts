import { FlightDatum } from "../store/models/flight_datum";

export default interface Loader {
  willHandle(): boolean;
  loadFlightGroup(): Promise<FlightDatum[]>;
}
