import FlightGroup from "glana/src/analysis/flight_group";
import SavedFlight from "glana/src/saved_flight";
import { Colors } from "../../colors";
import { defaultSettings, flightComputer, Settings } from "../../settings";
import { ActionType, Action } from "../actions";

export type DrawerView = "settings" | "flights" | null;

export type FlightDatum = {
  id: string;
  flight: SavedFlight;
  color: string;
};

export type FlightDataById = { [key: string]: FlightDatum };

export interface AnalysisState {
  flightGroup: FlightGroup;
  flightDataById: FlightDataById;
  flightData: FlightDatum[];
  followFlightId: string;
  activeTimestamp: Date;
}

export interface State {
  analysis: AnalysisState | null;
  sideDrawer: {
    view: DrawerView;
  };
  settings: Settings;
  isLoading: boolean;
  isPlaying: boolean;
}

export function initialState(): State {
  return {
    analysis: null,
    isLoading: true,
    isPlaying: false,
    sideDrawer: {
      view: null
    },
    settings: defaultSettings()
  };
}

export function reducer(state: State, action: Action): State {
  const { sideDrawer } = state;
  const { view } = sideDrawer;
  let newView: DrawerView;

  switch (action.type) {
    case ActionType.SetFlightGroup:
      const { flightGroup } = action;
      const analysis = buildAnalysisState(state, flightGroup);

      return {
        ...state,
        ...analysis,
        analysis,
        isLoading: false
      };
    case ActionType.SetActiveTimestamp:
      if (!state.analysis) return state;

      return {
        ...state,
        analysis: { ...state.analysis, activeTimestamp: action.timestamp }
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
      if (view === "flights") {
        newView = null;
      } else {
        newView = "flights";
      }
      return {
        ...state,
        sideDrawer: { ...sideDrawer, view: newView }
      };
    case ActionType.ToggleSettings:
      if (view === "settings") {
        newView = null;
      } else {
        newView = "settings";
      }

      return {
        ...state,
        sideDrawer: { ...sideDrawer, view: newView }
      };
    case ActionType.CloseDrawer:
      return {
        ...state,
        sideDrawer: { ...sideDrawer, view: null }
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
          {
            followFlightId: state.analysis.followFlightId,
            activeTimestamp: state.analysis.activeTimestamp
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
  }
}

function buildAnalysisState(
  state: State,
  flightGroup: FlightGroup,
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
    flightGroup,
    flightData,
    flightDataById,
    followFlightId: flightGroup.flights[0].id,
    activeTimestamp: flightGroup.earliestDatumAt,
    ...overrides
  };
}
