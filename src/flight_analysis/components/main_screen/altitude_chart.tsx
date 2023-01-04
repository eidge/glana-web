import { ResponsiveLineCanvas as Line } from "@nivo/line";

import { Datum } from "glana/src/flight_computer/computer";
import SavedFlight from "glana/src/saved_flight";
import React from "react";
import { useMemo } from "react";
import { splitWhen } from "../../../utils/arrays";
import { FlightDatum } from "../../store/models/flight_datum";

const MAX_POINTS = 500;

interface Props {
  flightData: FlightDatum[];
  followFlightId: string;
}

function AltitudeChart(props: Props) {
  const { flightData, followFlightId } = props;
  const sortedData = useMemo(
    () => followedFlightLast(flightData, followFlightId),
    [flightData, followFlightId]
  );
  const chartData = useMemo(
    () => buildChartData(sortedData, followFlightId),
    [sortedData, followFlightId]
  );
  const colors = chartData.map((d) => d.color);

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

function followedFlightLast(flightData: FlightDatum[], followFlightId: string) {
  return flightData.slice().sort((a, _b) => (a.id === followFlightId ? 1 : -1));
}

function buildChartData(flightData: FlightDatum[], followFlightId: string) {
  return flightData.flatMap((flightDatum) =>
    chartData(flightDatum, flightDatum.id === followFlightId)
  );
}

function chartData(flightDatum: FlightDatum, isActive: boolean) {
  let datums = limitNumberOfPoints(flightDatum.flight, MAX_POINTS);
  return splitFlightByEngineSegments(flightDatum, datums, isActive);
}

function splitFlightByEngineSegments(
  flightDatum: FlightDatum,
  datums: Datum[],
  isActive: boolean
) {
  const groups = splitWhen(datums, (datum) => isEngineOn(datum), {
    includeLastValueInBothGroups: true,
  });

  return groups.map((group) => {
    const data = group.map((datum) => {
      return {
        x: datum.timestamp.getTime(),
        y: datum.position.altitude.value,
      };
    });

    const color = isEngineOn(group[0]) ? "#FF0000" : flightDatum.color;

    return {
      id: `altitude-${data[0].x}-${data[data.length - 1].x}`,
      data: data,
      color: isActive ? color : `${color}66`,
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
