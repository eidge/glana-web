import Analysis from "./analysis";
import React from "react";
import { StoreProvider } from "../store";
import FlightGroup from "glana/src/analysis/flight_group";

interface Props {
  flightGroup?: FlightGroup;
}

export default function FlightAnalysis(props: Props) {
  return (
    <StoreProvider flightGroup={props.flightGroup}>
      <Analysis />
    </StoreProvider>
  );
}
