import { ResponsiveLineCanvas as Line } from "@nivo/line";

import { Datum } from "glana/src/flight_computer/computer";
import SavedFlight from "glana/src/saved_flight";
import React from "react";
import { useMemo } from "react";
import { splitWhen } from "../../utils/arrays";
import { FlightDatum } from "../store/reducer";

const MAX_POINTS = 500;

interface Props {
  flightData: FlightDatum[];
}

function AltitudeChart(props: Props) {
  const { flightData } = props;
  const chartData = useMemo(() => buildChartData(flightData), [flightData]);
  const colors = flightData.map(d => d.color);

  return (
    <Line
      data={chartData}
      enableGridX={false}
      enableGridY={false}
      isInteractive={false}
      enableArea={true}
      enableSlices={false}
      enablePoints={false}
      margin={{ top: 1 }}
      xScale={{ type: "linear", min: "auto", max: "auto" }}
      curve="monotoneX"
      colors={colors}
    />
  );
}

export default React.memo(AltitudeChart);

function buildChartData(flightData: FlightDatum[]) {
  return flightData.flatMap(flightDatum => chartData(flightDatum));
}

function chartData(flightDatum: FlightDatum) {
  let datums = limitNumberOfPoints(flightDatum.flight, MAX_POINTS);
  return splitFlightByEngineSegments(flightDatum, datums);
}

function splitFlightByEngineSegments(
  flightDatum: FlightDatum,
  datums: Datum[]
) {
  const groups = splitWhen(datums, datum => isEngineOn(datum), {
    includeLastValueInBothGroups: true
  });

  return groups.map(group => {
    const data = group.map(datum => {
      return {
        x: datum.timestamp.getTime(),
        y: datum.position.altitude.value
      };
    });

    return {
      id: `altitude-${data[0].x}-${data[data.length - 1].x}`,
      data: data,
      color: isEngineOn(group[0]) ? "red" : flightDatum.color
    };
  });
}

function isEngineOn(datum: Datum) {
  return datum.calculatedValues.engineOn?.value === 1;
}

function limitNumberOfPoints(flight: SavedFlight, maxPoints: number) {
  let datums = flight.datums;

  if (datums.length > maxPoints) {
    let numberOfSamples = Math.round(datums.length / maxPoints);
    let sampledDatums: Datum[] = [];
    datums.forEach((datum: Datum, index: number) => {
      if (index % numberOfSamples === 0) {
        sampledDatums.push(datum);
      }
    });
    datums = sampledDatums;
  }

  return datums;
}
