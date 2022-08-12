import { Duration, milliseconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";
import analytics from "../../analytics";
import { Settings } from "../settings";
import { FlightDatum, Picture } from "./models/flight_datum";

export enum ActionType {
  SetFlightData = "SET_FLIGHT_DATA",
  SetActiveTimestamp = "SET_ACTIVE_TIMESTAMP",
  TogglePlay = "TOGGLE_PLAY",
  ToggleFlights = "TOGGLE_FLIGHTS",
  ToggleSettings = "TOGGLE_SETTINGS",
  ShowFlightUploader = "SHOW_FLIGHT_UPLOADER",
  CloseDrawer = "CLOSE_DRAWER",
  AdvanceActiveTimestamp = "ADVANCE_ACTIVE_TIMESTAMP",
  ChangeSettings = "CHANGE_SETTINGS",
  SetFollowFlight = "SET_FOLLOW_FLIGHT",
  SetDebug = "SET_DEBUG",
  OpenPicture = "OPEN_PICTURE",
  ClosePicture = "CLOSE_PICTURE",
}

export const actions = {
  setFlightData,
  setActiveTimestamp,
  advanceActiveTimestamp,
  togglePlay,
  toggleFlights,
  toggleSettings,
  showFlightUploader,
  closeDrawer,
  changeSettings,
  setFollowFlight,
  openPicture,
  closePicture,
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
