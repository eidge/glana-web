import { synchronizationMethods } from "glana/src/analysis/flight_group";
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import AverageVario from "glana/src/flight_computer/calculators/average_vario";
import Calculator from "glana/src/flight_computer/calculators/calculator";
import EngineInUse from "glana/src/flight_computer/calculators/engine_in_use";
import FlightComputer from "glana/src/flight_computer/computer";
import { seconds } from "glana/src/units/duration";

export type UnitOption = "metric" | "imperial";

export interface Settings {
  synchronizationMethod: SynchronizationMethod;
  renderFullTracks: boolean;
  followFlight: boolean;
  playbackSpeed: number;
  units: UnitOption;
  showAirspace: boolean;
}

export function defaultSettings(): Settings {
  return {
    synchronizationMethod: synchronizationMethods.recordingStarted,
    renderFullTracks: false,
    followFlight: true,
    playbackSpeed: 250,
    units: "imperial",
    showAirspace: false
  };
}

export function flightComputer() {
  return new FlightComputer(
    new Map([
      ["averageVario", new AverageVario(seconds(30)) as Calculator],
      ["engineOn", new EngineInUse(0.5) as Calculator]
    ])
  );
}
