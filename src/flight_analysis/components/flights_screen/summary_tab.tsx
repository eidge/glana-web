import { FlightDatum } from "../../store/models/flight_datum";
import FlightLabel from "../../../ui/components/flight_label";
import Icon from "../../../ui/components/icon";
import Button from "../../../ui/components/button";
import { durationToHuman } from "../../../utils/human";
import Task from "glana/src/flight_computer/tasks/task";
import { kilometers } from "glana/src/units/length";
import { kilometersPerHour } from "glana/src/units/speed";
import { useEffect } from "react";
import analytics from "../../../analytics";

interface Props {
  flightData: FlightDatum[];
  followFlightId: string;
  onSelectFlight: (fd: FlightDatum) => void;
  showFlightUploader: () => void;
}

export default function SummaryTab(props: Props) {
  const { flightData, followFlightId, onSelectFlight, showFlightUploader } =
    props;
  useEffect(() => analytics.trackEvent("viewed_stats_summary"), []);

  return (
    <div className="space-y-3">
      {flightData.map((fd) => (
        <FlightSummary
          key={fd.id}
          flightDatum={fd}
          isActive={fd.id === followFlightId}
          onClick={onSelectFlight}
        />
      ))}

      <div className="text-center">
        <Button
          size="md"
          color="white"
          type="simple"
          text="change flights"
          onClick={showFlightUploader}
        />
      </div>
    </div>
  );
}

interface FlightSummaryProps {
  flightDatum: FlightDatum;
  isActive: boolean;
  onClick: (flightDatum: FlightDatum) => void;
}

function FlightSummary(props: FlightSummaryProps) {
  const { flightDatum, isActive, onClick } = props;
  const { pilotName } = flightDatum.flight.metadata;
  const { task } = flightDatum.flight;
  const onClickFlight = () => {
    onClick(flightDatum);
  };

  let containerClasses =
    "rounded border border-gray-600 p-3 shadow hover:border-primary cursor-pointer";
  if (isActive) containerClasses += " border-primary";

  return (
    <div className={containerClasses} onClick={onClickFlight}>
      <div className="flex flex-row leading-none">
        <FlightLabel flightDatum={flightDatum} isActive={isActive} />
        {pilotName && <span className="ml-3">{pilotName}</span>}
      </div>
      <div className="pl-4 pt-3 leading-none flex flex-row items-center">
        <Icon icon="calendar" size="md" />
        <span className="ml-2 mr-4">
          {(
            flightDatum.flight.getTakeoffAt(true) ||
            flightDatum.flight.getRecordingStartedAt(true)
          ).toLocaleDateString()}
        </span>
      </div>

      <div className="pl-4 pt-3 leading-none flex flex-row items-center">
        <Icon icon="clock" size="md" />
        <span className="ml-2">
          {flightDatum.flight.getTakeoffAt(true)?.toLocaleTimeString()} -{" "}
          {flightDatum.flight.getLandedAt(true)?.toLocaleTimeString()} (
          {durationToHuman(flightDatum.flight.getDuration())})
        </span>
      </div>

      {task && (
        <div className="pl-4 pt-3 leading-none flex flex-row items-center">
          <Icon icon="map" size="md" />
          <span className="ml-2">{taskValue(task)}</span>
        </div>
      )}
    </div>
  );
}

function taskValue(task: Task) {
  let result = task.getDistance().convertTo(kilometers).toString();

  if (task.isFinished()) {
    const speedInKPH = task.getSpeed()!.convertTo(kilometersPerHour);
    const duration = durationToHuman(task.getDuration()!, true);
    result += ` @ ${speedInKPH} (${duration})`;
  } else {
    result += " (abandoned)";
  }

  return result;
}
