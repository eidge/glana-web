import { synchronizationMethods } from "glana/src/analysis/flight_group";
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import AverageVario from "glana/src/flight_computer/calculators/average_vario";
import PressureAltitude from "glana/src/flight_computer/calculators/pressure_altitude";
import Calculator from "glana/src/flight_computer/calculators/calculator";
import EngineInUse from "glana/src/flight_computer/calculators/engine_in_use";
import FlightComputer from "glana/src/flight_computer/computer";
import { seconds } from "glana/src/units/duration";
import { QuantityFactory } from "glana/src/units/quantity_factory";
import {
  feet,
  kilometers,
  meters,
  Meter,
  Length,
} from "glana/src/units/length";
import {
  kilometersPerHour,
  knots,
  metersPerSecond,
  Speed,
} from "glana/src/units/speed";
import { hpa, Pressure } from "glana/src/units/pressure";
import Quantity from "glana/src/units/quantity";

export type UnitOption = "metric" | "imperial";

export interface Settings {
  synchronizationMethod: SynchronizationMethod;
  renderFullTracks: boolean;
  followFlight: boolean;
  playbackSpeed: number;
  units: UnitOption;
  showAirspace: boolean;
  showWeather: boolean;
  qnh: Quantity<Pressure>;
}

export interface UnitSettings {
  vario: QuantityFactory<Speed>;
  altitude: QuantityFactory<Meter>;
  speed: QuantityFactory<Speed>;
  distance: QuantityFactory<Length>;
  pressure: QuantityFactory<Pressure>;
}

export const units: { [key in UnitOption]: UnitSettings } = {
  metric: {
    vario: metersPerSecond,
    altitude: meters,
    speed: kilometersPerHour,
    distance: kilometers,
    pressure: hpa,
  },
  imperial: {
    vario: knots,
    altitude: feet,
    speed: knots,
    distance: kilometers,
    pressure: hpa,
  },
};

export function defaultSettings(): Settings {
  return {
    synchronizationMethod: synchronizationMethods.realTime,
    renderFullTracks: false,
    followFlight: true,
    playbackSpeed: 250,
    units: "imperial",
    showAirspace: false,
    showWeather: false,
    qnh: hpa(1013.25),
  };
}

export function flightComputer(settings: Settings) {
  return new FlightComputer(
    new Map([
      ["pressureAltitude", new PressureAltitude(settings.qnh) as Calculator],
      ["averageVario", new AverageVario(seconds(30)) as Calculator],
      ["engineOn", new EngineInUse(0.4) as Calculator],
    ])
  );
}
