import Task from "glana/src/flight_computer/tasks/task";
import SavedFlight from "glana/src/saved_flight";
import { kilometers } from "glana/src/units/length";
import { kilometersPerHour } from "glana/src/units/speed";
import React from "react";
import { durationToHuman } from "../../../utils/human";
import FlightLabel from "../../ui/flight_label";

const detail = (label: string, value?: string | null) => {
  if (!value) return null;

  return (
    <div>
      <strong>{label}: </strong>
      {value}
    </div>
  );
};

const taskValue = (task: Task | null) => {
  if (!task) return null;
  let result = task
    .getDistance()
    .convertTo(kilometers)
    .toString();

  if (task.isFinished()) {
    const speedInKPH = task.getSpeed()!.convertTo(kilometersPerHour);
    result += ` @ ${speedInKPH}`;
  } else {
    result += " (abandoned)";
  }

  return result;
};

interface Props {
  flight: SavedFlight;
  isActive: boolean;
}

function FlightSummary(props: Props) {
  return (
    <div className="space-y-3">
      <FlightLabel
        flight={props.flight}
        isActive={props.isActive}
        isCompact={false}
      />
      <div>
        {detail("Pilot", props.flight.metadata.pilotName)}
        {detail("Date", props.flight.getTakeoffAt(true)?.toLocaleDateString())}
        <div className="flex flex-row space-x-3">
          {detail(
            "Time",
            `${props.flight
              .getTakeoffAt(true)
              ?.toLocaleTimeString()} - ${props.flight
              .getLandedAt(true)
              ?.toLocaleTimeString()}`
          )}
          <div>({durationToHuman(props.flight.getDuration())})</div>
        </div>
        <div className="flex flex-row space-x-3">
          {detail("Task", taskValue(props.flight.task))}
          {props.flight.task?.getDuration() && (
            <div>({durationToHuman(props.flight.task!.getDuration()!)})</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FlightSummary);
