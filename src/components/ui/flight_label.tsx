import SavedFlight from "glana/src/saved_flight";
import { COLORS } from "../../../src/maps/flight_renderer";

interface Props {
  flight: SavedFlight;
  isActive: boolean;
  isCompact: boolean;
}

const labelText = (flight: SavedFlight) => {
  return flight.metadata.callsign || flight.metadata.registration || "N/A";
};

const containerClasses = (isCompact: boolean) => {
  const textSize = isCompact ? "text-sm" : "text-base";
  return `flex flex-row items-center font-semibold leading-none whitespace-nowrap ${textSize}`;
};

export default function FlightLabel(props: Props) {
  const color = COLORS.getColorFor(props.flight);
  return (
    <div className={containerClasses(props.isCompact)}>
      <div
        className="w-2 h-2 rounded-full mr-2 flex-shrink-0 border-2"
        style={{
          backgroundColor: props.isActive ? color : "transparent",
          borderColor: color
        }}
      ></div>
      <div className="overflow-hidden">{labelText(props.flight)}</div>
    </div>
  );
}
