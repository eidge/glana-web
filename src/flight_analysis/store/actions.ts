import FlightGroup from "glana/src/analysis/flight_group";
import { Duration, milliseconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";
import analytics from "../../analytics";
import { Settings } from "../settings";
import { FlightDatum } from "./reducer";

export enum ActionType {
  SetFlightGroup = "SET_FLIGHT_GROUP",
  SetActiveTimestamp = "SET_ACTIVE_TIMESTAMP",
  TogglePlay = "TOGGLE_PLAY",
  ToggleFlights = "TOGGLE_FLIGHTS",
  ToggleSettings = "TOGGLE_SETTINGS",
  CloseDrawer = "CLOSE_DRAWER",
  AdvanceActiveTimestamp = "ADVANCE_ACTIVE_TIMESTAMP",
  ChangeSettings = "CHANGE_SETTINGS",
  SetFollowFlight = "SET_FOLLOW_FLIGHT"
}

export const actions = {
  setFlightGroup,
  setActiveTimestamp,
  advanceActiveTimestamp,
  togglePlay,
  toggleFlights,
  toggleSettings,
  closeDrawer,
  changeSettings,
  setFollowFlight
};

// Magic to produce a union type of all return values of our action functions.
const actionFns = Object.values(actions);
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export type Action = ReturnType<ElementType<typeof actionFns>>;

function setFlightGroup(flightGroup: FlightGroup) {
  analytics.trackEvent("loaded_flights", {
    count: flightGroup.flights.length
  });
  return {
    type: ActionType.SetFlightGroup as ActionType.SetFlightGroup,
    flightGroup: flightGroup
  };
}

function setActiveTimestamp(timestamp: Date) {
  return {
    type: ActionType.SetActiveTimestamp as ActionType.SetActiveTimestamp,
    timestamp: timestamp
  };
}

function advanceActiveTimestamp(duration: Quantity<Duration>) {
  return {
    type: ActionType.AdvanceActiveTimestamp as ActionType.AdvanceActiveTimestamp,
    deltaInMillis: duration.convertTo(milliseconds).value
  };
}

function togglePlay() {
  return {
    type: ActionType.TogglePlay as ActionType.TogglePlay
  };
}

function toggleFlights() {
  return {
    type: ActionType.ToggleFlights as ActionType.ToggleFlights
  };
}

function toggleSettings() {
  return {
    type: ActionType.ToggleSettings as ActionType.ToggleSettings
  };
}

function closeDrawer() {
  return {
    type: ActionType.CloseDrawer as ActionType.CloseDrawer
  };
}

function changeSettings(changes: Partial<Settings>) {
  const attribute = Object.keys(changes)[0];
  const value = Object.values(changes)[0];
  analytics.trackEvent("settings_changed", {
    attribute,
    value
  });

  return {
    type: ActionType.ChangeSettings as ActionType.ChangeSettings,
    changes: changes
  };
}

function setFollowFlight(flightDatum: FlightDatum) {
  return {
    type: ActionType.SetFollowFlight as ActionType.SetFollowFlight,
    flightDatum
  };
}
