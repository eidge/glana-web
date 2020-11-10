import SavedFlight from "glana/src/saved_flight";
import { Component } from "react";
import { COLORS } from "../../maps/flight_renderer";

interface Props {
  flight: SavedFlight;
  relativeLeftPositionAt: (timestamp: Date) => number;
}

interface State {}

export default class TaskTimeline extends Component<Props, State> {
  render() {
    const task = this.props.flight.task;
    if (!task) return null;

    const flight = this.props.flight;
    const turnpointMarkers = task.turnpoints.map((tp, index) => {
      const crossedAt = flight.getTurnpointReachedAt(tp);
      const nextCrossedAt = flight.getTurnpointReachedAt(
        task.turnpoints[index + 1]
      );

      if (!crossedAt || !nextCrossedAt) return null;

      return (
        <div
          className="absolute font-bold h-full"
          style={this.style(crossedAt, nextCrossedAt, index)}
        ></div>
      );
    });

    return (
      <div
        className="relative w-full h-2"
        style={{ backgroundColor: `${COLORS.getColorFor(flight)}66` }}
      >
        {turnpointMarkers}
      </div>
    );
  }

  private style(crossedAt: Date, nextCrossedAt: Date, index: number) {
    const left = this.props.relativeLeftPositionAt(crossedAt);
    const nextLeft = this.props.relativeLeftPositionAt(nextCrossedAt);
    const width = nextLeft - left;
    const color = COLORS.getColorFor(this.props.flight);
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
}
