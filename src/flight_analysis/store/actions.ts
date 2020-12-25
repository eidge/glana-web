import FlightGroup from "glana/src/analysis/flight_group";
import { Duration, milliseconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";
import analytics from "../../analytics";

export enum ActionType {
  SetFlightGroup = "SET_FLIGHT_GROUP",
  SetActiveTimestamp = "SET_ACTIVE_TIMESTAMP",
  TogglePlay = "TOGGLE_PLAY",
  ToggleStats = "TOGGLE_STATS",
  ToggleSettings = "TOGGLE_SETTINGS",
  CloseDrawer = "CLOSE_DRAWER",
  AdvanceActiveTimestamp = "ADVANCE_ACTIVE_TIMESTAMP"
}

export const actions = {
  setFlightGroup,
  setActiveTimestamp,
  advanceActiveTimestamp,
  togglePlay,
  toggleStats,
  toggleSettings,
  closeDrawer
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
    payload: flightGroup
  };
}

function setActiveTimestamp(timestamp: Date) {
  return {
    type: ActionType.SetActiveTimestamp as ActionType.SetActiveTimestamp,
    payload: timestamp
  };
}

function advanceActiveTimestamp(duration: Quantity<Duration>) {
  return {
    type: ActionType.AdvanceActiveTimestamp as ActionType.AdvanceActiveTimestamp,
    payload: duration.convertTo(milliseconds).value
  };
}

function togglePlay() {
  return {
    type: ActionType.TogglePlay as ActionType.TogglePlay
  };
}

function toggleStats() {
  return {
    type: ActionType.ToggleStats as ActionType.ToggleStats
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
