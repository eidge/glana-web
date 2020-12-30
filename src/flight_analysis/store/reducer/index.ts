import FlightGroup from "glana/src/analysis/flight_group";
import Task from "glana/src/flight_computer/tasks/task";
import SavedFlight from "glana/src/saved_flight";
import { Colors } from "../../colors";
import { defaultSettings, flightComputer, Settings } from "../../settings";
import { ActionType, Action } from "../actions";

export type DrawerView = "settings" | "flights" | "upload_flight";

export type DrawerState = {
  view: DrawerView;
  canClose: boolean;
};

export type FlightDatum = {
  id: string;
  flight: SavedFlight;
  color: string;
};

export type FlightDataById = { [key: string]: FlightDatum };

export interface AnalysisState {
  isSummary: boolean;
  task: Task | null;
  flightGroup: FlightGroup;
  flightDataById: FlightDataById;
  flightData: FlightDatum[];
  followFlightId: string;
  activeTimestamp: Date;
}

export interface State {
  analysis: AnalysisState | null;
  sideDrawer: DrawerState | null;
  settings: Settings;
  isLoading: boolean;
  isPlaying: boolean;
  isDebug: boolean;
}

export function initialState(): State {
  return {
    analysis: null,
    isLoading: true,
    isPlaying: false,
    sideDrawer: null,
    settings: defaultSettings(),
    isDebug: false
  };
}

export function reducer(state: State, action: Action): State {
  const { sideDrawer } = state;
  let newSideDrawer: DrawerState | null;

  switch (action.type) {
    case ActionType.SetFlightGroup:
      const { flightGroup } = action;
      const task = flightGroup.flights.map(f => f.task).find(t => !!t) || null;

      if (task) {
        flightGroup.flights.forEach(f => (f.task = new Task(task.turnpoints)));
      }

      const analysis = buildAnalysisState(state, flightGroup, task);

      return {
        ...state,
        ...analysis,
        analysis,
        isLoading: false,
        sideDrawer: null
      };
    case ActionType.SetActiveTimestamp:
      if (!state.analysis) return state;

      return {
        ...state,
        analysis: {
          ...state.analysis,
          activeTimestamp: action.timestamp,
          isSummary: false
        }
      };
    case ActionType.AdvanceActiveTimestamp:
      if (!state.analysis) return state;

      let {
        analysis: { activeTimestamp }
      } = state;

      if (!activeTimestamp) {
        activeTimestamp = state.analysis.flightDataById[
          state.analysis.followFlightId
        ].flight.getRecordingStartedAt();
      } else if (activeTimestamp > state.analysis.flightGroup.latestDatumAt) {
        return {
          ...state,
          analysis: {
            ...state.analysis,
            activeTimestamp: state.analysis.flightGroup.latestDatumAt
          },
          isPlaying: false
        };
      } else {
        activeTimestamp = new Date(
          activeTimestamp.getTime() + action.deltaInMillis
        );
      }

      return {
        ...state,
        analysis: { ...state.analysis, activeTimestamp: activeTimestamp }
      };
    case ActionType.TogglePlay:
      if (!state.analysis) return state;

      if (
        state.analysis.activeTimestamp >=
          state.analysis.flightGroup!.latestDatumAt &&
        !state.isPlaying
      ) {
        return {
          ...state,
          isPlaying: !state.isPlaying,
          analysis: {
            ...state.analysis,
            activeTimestamp: state.analysis.flightGroup.earliestDatumAt
          }
        };
      }
      return { ...state, isPlaying: !state.isPlaying };
    case ActionType.ToggleFlights:
      if (!sideDrawer || sideDrawer.view !== "flights") {
        newSideDrawer = { view: "flights", canClose: true };
      } else {
        newSideDrawer = null;
      }
      return {
        ...state,
        sideDrawer: newSideDrawer
      };
    case ActionType.ToggleSettings:
      if (!sideDrawer || sideDrawer.view !== "settings") {
        newSideDrawer = { view: "settings", canClose: true };
      } else {
        newSideDrawer = null;
      }

      return {
        ...state,
        sideDrawer: newSideDrawer
      };

    case ActionType.ShowFlightUploader:
      return {
        ...state,
        sideDrawer: { view: "upload_flight", canClose: !!state.analysis },
        isLoading: false
      };
    case ActionType.CloseDrawer:
      return {
        ...state,
        sideDrawer: null
      };
    case ActionType.ChangeSettings:
      const { changes } = action;
      const newState = {
        ...state,
        settings: { ...state.settings, ...changes }
      };

      if (
        state.analysis &&
        Object.keys(changes).includes("synchronizationMethod")
      ) {
        newState.analysis = buildAnalysisState(
          newState,
          state.analysis.flightGroup,
          state.analysis.task,
          {
            followFlightId: state.analysis.followFlightId,
            activeTimestamp: state.analysis.activeTimestamp,
            isSummary: state.analysis.isSummary
          }
        );
      }

      return newState;
    case ActionType.SetFollowFlight:
      if (!state.analysis) return state;

      return {
        ...state,
        analysis: { ...state.analysis, followFlightId: action.flightDatum.id }
      };

    case ActionType.SetDebug:
      return {
        ...state,
        isDebug: action.isDebug
      };
  }
}

function buildAnalysisState(
  state: State,
  flightGroup: FlightGroup,
  task: Task | null,
  overrides: Partial<AnalysisState> = {}
) {
  const colors = new Colors();

  const flightData = flightGroup.flights.map(flight => ({
    id: flight.id,
    flight: flight,
    color: colors.nextColor()
  }));

  const flightDataById = flightData.reduce((byId: FlightDataById, data) => {
    byId[data.id] = data;
    return byId;
  }, {});

  flightGroup.flights.forEach(f => f.analise(flightComputer()));
  flightGroup.synchronize(state.settings.synchronizationMethod);
  flightGroup = Object.create(flightGroup);

  return {
    task,
    flightGroup,
    flightData,
    flightDataById,
    followFlightId: flightGroup.flights[0].id,
    activeTimestamp: flightGroup.earliestDatumAt,
    isSummary: true,
    ...overrides
  };
}
