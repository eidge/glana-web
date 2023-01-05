import Task from "glana/src/flight_computer/tasks/task";
import { Duration, milliseconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";
import analytics from "../../analytics";
import { Settings } from "../settings";
import { FlightDatum, Picture } from "./models/flight_datum";

export enum ActionType {
  AdvanceActiveTimestamp = "ADVANCE_ACTIVE_TIMESTAMP",
  ChangeSettings = "CHANGE_SETTINGS",
  CloseDrawer = "CLOSE_DRAWER",
  ClosePicture = "CLOSE_PICTURE",
  OpenPicture = "OPEN_PICTURE",
  SetActiveTask = "SET_ACTIVE_TASK",
  SetActiveTimestamp = "SET_ACTIVE_TIMESTAMP",
  SetDebug = "SET_DEBUG",
  SetFlightData = "SET_FLIGHT_DATA",
  SetFollowFlight = "SET_FOLLOW_FLIGHT",
  ShowFlightUploader = "SHOW_FLIGHT_UPLOADER",
  ToggleFlights = "TOGGLE_FLIGHTS",
  TogglePlay = "TOGGLE_PLAY",
  ToggleSettings = "TOGGLE_SETTINGS",
}

export const actions = {
  advanceActiveTimestamp,
  changeSettings,
  closeDrawer,
  closePicture,
  openPicture,
  setActiveTask,
  setActiveTimestamp,
  setFlightData,
  setFollowFlight,
  setDebug,
  showFlightUploader,
  toggleFlights,
  togglePlay,
  toggleSettings,
};

// Magic to produce a union type of all return values of our action functions.
const actionFns = Object.values(actions);
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export type Action = ReturnType<ElementType<typeof actionFns>>;

function setFlightData(flightData: FlightDatum[]) {
  analytics.trackEvent("loaded_flights", {
    count: flightData.length,
  });
  return {
    type: ActionType.SetFlightData as ActionType.SetFlightData,
    flightData: flightData,
  };
}

function setActiveTimestamp(timestamp: Date) {
  return {
    type: ActionType.SetActiveTimestamp as ActionType.SetActiveTimestamp,
    timestamp: timestamp,
  };
}

function setActiveTask(task: Task) {
  return {
    type: ActionType.SetActiveTask as ActionType.SetActiveTask,
    task: task,
  };
}

function advanceActiveTimestamp(duration: Quantity<Duration>) {
  return {
    type: ActionType.AdvanceActiveTimestamp as ActionType.AdvanceActiveTimestamp,
    deltaInMillis: duration.convertTo(milliseconds).value,
  };
}

function togglePlay() {
  return {
    type: ActionType.TogglePlay as ActionType.TogglePlay,
  };
}

function toggleFlights() {
  return {
    type: ActionType.ToggleFlights as ActionType.ToggleFlights,
  };
}

function toggleSettings() {
  return {
    type: ActionType.ToggleSettings as ActionType.ToggleSettings,
  };
}

function showFlightUploader() {
  return {
    type: ActionType.ShowFlightUploader as ActionType.ShowFlightUploader,
  };
}

function closeDrawer() {
  return {
    type: ActionType.CloseDrawer as ActionType.CloseDrawer,
  };
}

function changeSettings(changes: Partial<Settings>) {
  (Object.keys(changes) as (keyof Settings)[]).forEach((attribute) => {
    analytics.trackEvent("settings_changed", {
      attribute,
      value: changes[attribute],
    });
  });

  return {
    type: ActionType.ChangeSettings as ActionType.ChangeSettings,
    changes: changes,
  };
}

function setFollowFlight(flightDatum: FlightDatum) {
  return {
    type: ActionType.SetFollowFlight as ActionType.SetFollowFlight,
    flightDatum,
  };
}

function setDebug(isDebug: boolean) {
  return {
    type: ActionType.SetDebug as ActionType.SetDebug,
    isDebug,
  };
}

function openPicture(picture: Picture) {
  return {
    type: ActionType.OpenPicture as ActionType.OpenPicture,
    picture,
  };
}

function closePicture() {
  return {
    type: ActionType.ClosePicture as ActionType.ClosePicture,
  };
}
