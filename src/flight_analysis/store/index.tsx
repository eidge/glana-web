import React, { ReactNode, useContext, useEffect, useReducer } from "react";
import { initialState, reducer } from "./reducer";
import { Action, actions } from "./actions";
import FlightGroup from "glana/src/analysis/flight_group";

const StateContext = React.createContext(initialState());
const DispatchContent = React.createContext<React.Dispatch<Action>>(() => {});

interface ProviderProps {
  flightGroup?: FlightGroup;
  children: ReactNode;
}

export function StoreProvider(props: ProviderProps) {
  const { flightGroup } = props;
  const [state, dispatch] = useReducer(reducer, initialState());
  useEffect(() => {
    if (flightGroup) {
      dispatch(actions.setFlightGroup(flightGroup));
    }
    if (typeof window !== "undefined") {
      //@ts-ignore
      window.glana = {
        setDebug: (isDebug: boolean) => dispatch(actions.setDebug(isDebug))
      };
    }
  }, [flightGroup]);
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
