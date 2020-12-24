import FlightGroup from "glana/src/analysis/flight_group";

export default interface Loader {
  willHandle(): boolean;
  loadFlightGroup(): Promise<FlightGroup>;
}
