import Task, { TaskTurnpoint } from "glana/src/flight_computer/tasks/task";
import React from "react";
import { FlightDatum } from "../../store/models/flight_datum";
import { relativeTo } from "../../utils/time";

interface Props {
  flightDatum: FlightDatum;
  startAt: Date;
  finishAt: Date;
}

function TaskTimeline(props: Props) {
  const { flightDatum, startAt, finishAt } = props;
  const flight = flightDatum.flight;
  const task = flight.task;
  if (!task || !task.isStarted()) return null;

  const turnpointMarkers = task.turnpoints.map((tp, index) =>
    renderTaskLeg(flightDatum, task, tp, startAt, finishAt, index)
  );

  return (
    <div
      className="relative w-full h-2"
      style={{ backgroundColor: `${flightDatum.color}66` }}
    >
      {turnpointMarkers}
    </div>
  );
}

export default React.memo(TaskTimeline);

function renderTaskLeg(
  flightDatum: FlightDatum,
  task: Task,
  tp: TaskTurnpoint,
  startAt: Date,
  finishAt: Date,
  index: number
) {
  const flight = flightDatum.flight;
  const crossedAt = flight.getTurnpointReachedAt(tp);
  const nextCrossedAt = flight.getTurnpointReachedAt(
    task.turnpoints[index + 1]
  );

  if (!crossedAt || !nextCrossedAt) return null;

  return (
    <div
      key={index}
      className="absolute font-bold h-full"
      style={taskLegStyle(
        flightDatum,
        crossedAt,
        nextCrossedAt,
        startAt,
        finishAt,
        index
      )}
    ></div>
  );
}

function taskLegStyle(
  flightDatum: FlightDatum,
  crossedAt: Date,
  nextCrossedAt: Date,
  startAt: Date,
  finishAt: Date,
  index: number
) {
  const left = relativeTo(startAt, finishAt, crossedAt) * 100;
  const nextLeft = relativeTo(startAt, finishAt, nextCrossedAt) * 100;
  const width = nextLeft - left;
  const color = flightDatum.color;
  const style: any = {
    left: `${left}%`,
    width: `${width}%`,
    backgroundColor: color,
  };

  if (index % 2 === 0) {
    style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23FFFFFF' fill-opacity='1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`;
  }

  return style;
}
