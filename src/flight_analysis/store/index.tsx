import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { initialState, reducer } from "./reducer";
import { Action, actions } from "./actions";
import { FlightDatum } from "./models/flight_datum";
import { isProduction } from "../../utils/environment";

const StateContext = React.createContext(initialState());
const DispatchContent = React.createContext<React.Dispatch<Action>>(() => {});

interface ProviderProps {
  flightData?: FlightDatum[];
  children: ReactNode;
}

class GlanaApi {
  readonly dispatch: React.Dispatch<Action>;
  actions: typeof actions;

  constructor(dispatch: React.Dispatch<Action>) {
    this.dispatch = dispatch;
    this.actions = actions;

    this.restoreDebugSetting();
  }

  private restoreDebugSetting() {
    const isDebug = localStorage.getItem("debug") === "true";
    this.setDebug(isDebug);
  }

  setDebug(isDebug: boolean) {
    this.dispatch(this.actions.setDebug(isDebug));
    localStorage.setItem("debug", isDebug.toString());
  }
}

export function StoreProvider(props: ProviderProps) {
  const { flightData } = props;
  const [state, dispatch] = useReducer(reducer, initialState());
  const { isDebug } = state;
  const wrappedDispatch = useCallback(
    (action: Action) => {
      if (isDebug) console.debug("dispatch:", action);
      return dispatch(action);
    },
    [dispatch, isDebug]
  );

  useEffect(() => {
    if (flightData) {
      wrappedDispatch(actions.setFlightData(flightData));
    } else {
      wrappedDispatch(actions.showFlightUploader());
    }

    if (typeof window !== "undefined" && !isProduction()) {
      //@ts-ignore
      window.glana = new GlanaApi(wrappedDispatch);
      //@ts-ignore
      console.log("Debug object created on `window.glana`: ", window.glana);
    }
  }, [wrappedDispatch, flightData]);

  return (
    <DispatchContent.Provider value={wrappedDispatch}>
      <StateContext.Provider value={state}>
        {props.children}
      </StateContext.Provider>
    </DispatchContent.Provider>
  );
}

export function useFlightAnalysisState() {
  return useContext(StateContext);
}

export function useFlightAnalysisDispatch() {
  return useContext(DispatchContent);
}
