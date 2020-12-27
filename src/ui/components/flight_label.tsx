import SavedFlight from "glana/src/saved_flight";
import { FlightDatum } from "../../flight_analysis/store/reducer";

interface Props {
  flightDatum: FlightDatum;
  isActive: boolean;
}

const labelText = (flight: SavedFlight) => {
  return flight.metadata.callsign || flight.metadata.registration || "G-DOE";
};

const containerClasses = () => {
  const textSize = "text-base";
  return `inline-flex flex-row items-center text-base font-semibold leading-none whitespace-nowrap ${textSize}`;
};

export default function FlightLabel(props: Props) {
  const { flightDatum, isActive } = props;
  const color = flightDatum.color;

  return (
    <div className={containerClasses()}>
      <div
        className="w-2 h-2 rounded-full mr-2 flex-shrink-0 border-2"
        style={{
          backgroundColor: isActive ? color : "transparent",
          borderColor: color
        }}
      ></div>
      <div className="overflow-hidden">{labelText(flightDatum.flight)}</div>
    </div>
  );
}
