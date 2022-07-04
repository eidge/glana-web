import Analysis from "./analysis";
import React from "react";
import { StoreProvider } from "../store";
import { FlightDatum } from "../store/models/flight_datum";

interface Props {
  flightData?: FlightDatum[];
}

export default function FlightAnalysis(props: Props) {
  return (
    <StoreProvider flightData={props.flightData}>
      <Analysis />
    </StoreProvider>
  );
}
