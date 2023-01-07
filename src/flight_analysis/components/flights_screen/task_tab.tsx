import Task from "glana/src/flight_computer/tasks/task";
import { kilometers } from "glana/src/units/length";
import { useCallback } from "react";
import Icon from "../../../ui/components/icon";
import { UnitSettings } from "../../settings";
import { FlightDatum } from "../../store/models/flight_datum";
import TaskStats from "./task_stats";
import TaskStatsPerLeg from "./task_stats_per_leg";

interface Props {
  flightData: FlightDatum[];
  activeTask: Task | null;
  availableTasks: Task[];
  onSelectTask: (task: Task) => void;
  unitSettings: UnitSettings;
  followFlightId: string;
}

export default function TaskTab(props: Props) {
  const { flightData, activeTask, unitSettings, followFlightId } = props;

  return (
    <div className="space-y-8">
      {taskSelector(props)}

      {activeTask && (
        <TaskStats
          flightData={flightData}
          unitSettings={unitSettings}
          followFlightId={followFlightId}
        />
      )}

      {activeTask && (
        <TaskStatsPerLeg
          flightData={flightData}
          task={activeTask}
          unitSettings={unitSettings}
          followFlightId={followFlightId}
        />
      )}
    </div>
  );
}

function taskSelector(props: Props) {
  const { availableTasks, activeTask, onSelectTask } = props;

  if (availableTasks.length === 0) {
    return <span>No tasks found on the given IGC files.</span>;
  }

  return (
    <div>
      <div className="mb-2 font-bold">Available tasks: </div>
      {availableTasks.map((t) => {
        const isActive = !!activeTask && t.isEqual(activeTask);
        return (
          <TaskRow
            key={t.name}
            task={t}
            isActive={isActive}
            onClick={onSelectTask}
          />
        );
      })}
    </div>
  );
}

interface TaskRowProps {
  isActive: boolean;
  task: Task;
  onClick: (task: Task) => void;
}

function TaskRow(props: TaskRowProps) {
  const { task, isActive, onClick } = props;
  const clickTask = useCallback(() => onClick(task), [onClick, task]);

  let containerClasses =
    "rounded border border-gray-600 p-3 shadow hover:border-primary cursor-pointer mb-2";
  if (isActive) containerClasses += " border-primary";

  return (
    <div className={containerClasses} onClick={clickTask}>
      <div className="leading-none flex flex-row">
        <Icon icon="map" size="md" className="flex-shrink-0" />
        <span className="ml-2">
          {task.distance.convertTo(kilometers).toString()}
        </span>
      </div>

      <div className="pt-3 leading-none flex flex-row">
        <Icon icon="mapPin" size="md" className="flex-shrink-0" />
        <div className="ml-2">
          {task.turnpoints.map((tp, i) => (
            <div key={i}>
              {tp.name}{" "}
              <span className="text-xs text-gray-300">
                {distanceToNextText(task, i)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function distanceToNextText(task: Task, i: number) {
  if (i === task.turnpoints.length - 1) return "";

  const distance = distanceToNext(task, i).convertTo(kilometers).toString();
  return ` ${distance}`;
}

function distanceToNext(task: Task, i: number) {
  if (i === task.turnpoints.length - 1) return kilometers(0);

  const current = task.turnpoints[i];
  const next = task.turnpoints[i + 1];
  return current.center.distance2DTo(next.center);
}
