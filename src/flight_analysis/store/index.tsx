import React, { ReactNode, useContext, useEffect, useReducer } from "react";
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

export function StoreProvider(props: ProviderProps) {
  const { flightData } = props;
  const [state, dispatch] = useReducer(reducer, initialState());
  useEffect(() => {
    if (flightData) {
      dispatch(actions.setFlightData(flightData));
    } else {
      dispatch(actions.showFlightUploader());
    }

    if (typeof window !== "undefined" && !isProduction()) {
      //@ts-ignore
      window.glana = {
        dispatch,
        actions
      };
      //@ts-ignore
      console.log("Debug object created on `window.glana`: ", window.glana);
    }
  }, [flightData]);
  return (
    <DispatchContent.Provider value={dispatch}>
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
