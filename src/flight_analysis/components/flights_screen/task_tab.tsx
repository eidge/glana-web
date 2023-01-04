import Task, { TaskTurnpoint } from "glana/src/flight_computer/tasks/task";
import { kilometers } from "glana/src/units/length";
import { useCallback } from "react";
import Icon from "../../../ui/components/icon";

interface Props {
  activeTask: Task | null;
  availableTasks: Task[];
  onSelectTask: (task: Task) => void;
}

export default function TaskTab(props: Props) {
  const { availableTasks, activeTask, onSelectTask } = props;

  return (
    <div className="space-y-3">
      {availableTasks.length === 0 && "No tasks found on the given IGC files."}
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
    "rounded border border-gray-600 p-3 shadow hover:border-primary cursor-pointer";
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
              {tp.name} {distanceToNext(task, tp, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function distanceToNext(task: Task, tp: TaskTurnpoint, i: number) {
  if (i === 0) return "";

  const previous = task.turnpoints[i - 1];
  const distance = tp.center
    .distance2DTo(previous.center)
    .convertTo(kilometers)
    .toString();

  return ` (${distance})`;
}
