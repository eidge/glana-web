import { UnitSettings } from "../../settings";
import { FlightDatum } from "../../store/reducer";
import FlightLabel from "../../../ui/components/flight_label";
import { ReactNode } from "react";

interface Props {
  flightData: FlightDatum[];
  followFlightId: string;
  onClick: (fd: FlightDatum) => void;
  timestamp: Date;
  unitSettings: UnitSettings;
}

export default function TimelineDetails(props: Props) {
  const {
    flightData,
    followFlightId,
    onClick,
    timestamp,
    unitSettings
  } = props;

  return (
    <div className="flex flex-row flex-wrap w-full justify-around bg-gray-700">
      {flightData.map(fd => (
        <TimelineDetail
          key={fd.id}
          flightDatum={fd}
          timestamp={timestamp}
          isActive={fd.id === followFlightId}
          onClick={onClick}
          unitSettings={unitSettings}
        />
      ))}
    </div>
  );
}

interface TimelineDetailProps {
  flightDatum: FlightDatum;
  isActive: boolean;
  onClick: (fd: FlightDatum) => void;
  timestamp: Date;
  unitSettings: UnitSettings;
}

function TimelineDetail(props: TimelineDetailProps) {
  const { flightDatum, timestamp, isActive, onClick, unitSettings } = props;
  const datum = flightDatum.flight.datumAt(timestamp);

  const altitude = datum.position.altitude.convertTo(unitSettings.altitude);
  const vario =
    datum.calculatedValues["averageVario"]?.convertTo(unitSettings.vario) ||
    unitSettings.vario(0);
  const speed = datum.speed.convertTo(unitSettings.speed);

  const isEngineOn = datum.calculatedValues["engineOn"]?.value === 1;
  const varioLabel = isEngineOn ? (
    <span className="text-failure">engine on</span>
  ) : (
    "vario"
  );

  return (
    <div
      className="flex-grow border-t border-gray-600 text-white py-2 leading-none flex flex-row justify-center items-center px-3 hover:bg-gray-800 cursor-pointer transition ease-in-out duration-200"
      onClick={() => onClick(flightDatum)}
    >
      <FlightLabel flightDatum={flightDatum} isActive={isActive} />
      <InstrumentValue
        label="altitude"
        value={altitude.toString({ precision: 0, padToSize: 4 })}
      />
      <InstrumentValue
        label={varioLabel}
        value={vario?.toString({
          precision: 1,
          padToSize: 3,
          alwaysShowSign: true
        })}
      />
      <InstrumentValue
        label="speed"
        value={speed.toString({ precision: 0, padToSize: 3 })}
      />
    </div>
  );
}

interface InstrumentValueProps {
  label: ReactNode;
  value: ReactNode;
}

function InstrumentValue(props: InstrumentValueProps) {
  const { label, value } = props;
  return (
    <div className="ml-6 flex flex-col items-start">
      <div className="text-sm font-mono leading-none">{value}</div>
      <div className="text-xs leading-none text-gray-400">{label}</div>
    </div>
  );
}
