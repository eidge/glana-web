import { Duration, milliseconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";
import { useMemo, useRef } from "react";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import { FlightDatum } from "../store/reducer";
import { absoluteFrom, relativeTo } from "../utils/time";
import AltitudeChart from "./altitude_chart";
import TaskTimeline from "./task_timeline";

export default function Timeline() {
  const {
    flightsById,
    activeTimestamp,
    followFlightId,
    flightGroup
  } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const elementRef = useRef<HTMLDivElement>(null);
  const flightData = useMemo(() => {
    return Object.values(flightsById);
  }, [flightsById]);

  if (flightData.length < 1 || !followFlightId) return null;

  const followFlight = flightsById[followFlightId];
  const timelineStartAt = flightGroup!.earliestDatumAt;
  const timelineFinishAt = flightGroup!.latestDatumAt;
  const setTimestampFromHoverCoordinate = (clientX: number) => {
    if (!elementRef.current) return;
    const clientRect = elementRef.current.getBoundingClientRect();
    const relativeLeft = (clientX - clientRect.left) / clientRect.width;
    const timestampAtEvent = absoluteFrom(
      timelineStartAt,
      timelineFinishAt,
      relativeLeft
    );
    dispatch(actions.setActiveTimestamp(timestampAtEvent));
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTimestampFromHoverCoordinate(event.clientX);
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const lastTouch = event.touches[event.touches.length - 1];
    setTimestampFromHoverCoordinate(lastTouch.clientX);
  };

  return (
    <div
      ref={elementRef}
      className="w-full cursor-crosshair relative"
      onClick={openInNewTab}
    >
      <div className="h-24">
        <AltitudeChart flightData={flightData} />
      </div>
      <div>
        {flightData.map(datum => (
          <TaskTimeline
            key={datum.flight.id}
            flightDatum={datum}
            startAt={timelineStartAt}
            finishAt={timelineFinishAt}
          />
        ))}
      </div>

      <TimelineMarker
        timelineStartAt={timelineStartAt}
        timelineFinishAt={timelineFinishAt}
        activeTimestamp={activeTimestamp}
        offset={followFlight.flight.offsetInMilliseconds}
      />

      <div
        className="w-full h-full absolute left-0 bottom-0"
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      ></div>
    </div>
  );
}

function computeTimelineStartAt(flightData: FlightDatum[]) {
  return flightData.map(d => d.flight.getRecordingStartedAt()).sort()[0];
}

function computeTimelineFinishAt(flightData: FlightDatum[]) {
  return flightData.map(d => d.flight.getRecordingStoppedAt()).sort()[
    flightData.length - 1
  ];
}

function openInNewTab() {
  window.open(
    "http://192.168.1.105:3000/?igcUrl=%2Fdun1.igc,%2Fdun2.igc,%2Fdun3.igc"
  );
}

function TimelineMarker(props: {
  timelineStartAt: Date;
  timelineFinishAt: Date;
  activeTimestamp: Date | null;
  offset: Quantity<Duration>;
}) {
  const { timelineStartAt, timelineFinishAt, activeTimestamp, offset } = props;

  if (!activeTimestamp) return null;

  const relativeLeftPosition =
    relativeTo(timelineStartAt, timelineFinishAt, activeTimestamp) * 100;
  const detailsStyle =
    relativeLeftPosition > 50 ? { right: "-1px" } : { left: "-2px" };
  const displayTimestamp = revertTimestampOffset(activeTimestamp, offset);

  return (
    <div
      className="absolute w-0 h-full bottom-0 border-l-2 border-white border-dashed shadow"
      style={{ left: `${relativeLeftPosition}%` }}
    >
      <div className="gl-details" style={detailsStyle}>
        {displayTimestamp.toLocaleTimeString()}
      </div>
      <style jsx>{`
        .gl-details {
          @apply absolute bottom-0 bg-white px-2 py-1 rounded shadow mb-1;
          @apply font-mono text-sm leading-none;
          bottom: 100%;
        }
      `}</style>
    </div>
  );
}

function revertTimestampOffset(timestamp: Date, offset: Quantity<Duration>) {
  let timestampInMillis = timestamp.getTime();
  let offsetInMillis = offset.convertTo(milliseconds).value;
  return new Date(timestampInMillis - offsetInMillis);
}
