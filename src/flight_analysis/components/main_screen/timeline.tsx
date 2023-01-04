import { Duration, milliseconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";
import { useRef, useEffect, useState, useCallback } from "react";
import { AnalysisState } from "../../store/reducer";
import { absoluteFrom, relativeTo } from "../../utils/time";
import AltitudeChart from "./altitude_chart";
import TaskTimeline from "./task_timeline";

interface Props {
  analysis: AnalysisState;
  isPlaying: boolean;
  setActiveTimestamp: (ts: Date) => void;
}

export default function Timeline(props: Props) {
  const { analysis, isPlaying, setActiveTimestamp } = props;
  const elementRef = useRef<HTMLDivElement>(null);
  const width = useComponentWidth(elementRef.current);
  usePreventDragScroll(elementRef);

  const {
    flightData,
    flightDataById,
    activeTimestamp,
    followFlightId,
    flightGroup,
  } = analysis;

  const followFlight = flightDataById[followFlightId];
  const timelineStartAt = flightGroup.earliestDatumAt;
  const timelineFinishAt = flightGroup.latestDatumAt;
  const setTimestampFromHoverCoordinate = useCallback(
    (clientX: number) => {
      if (!elementRef.current) return;
      const clientRect = elementRef.current.getBoundingClientRect();
      const relativeLeft = (clientX - clientRect.left) / clientRect.width;
      const timestampAtEvent = absoluteFrom(
        timelineStartAt,
        timelineFinishAt,
        relativeLeft
      );
      setActiveTimestamp(timestampAtEvent);
    },
    [timelineStartAt, timelineFinishAt, setActiveTimestamp]
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setTimestampFromHoverCoordinate(event.clientX);
    },
    [setTimestampFromHoverCoordinate]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isPlaying) return;
      setTimestampFromHoverCoordinate(event.clientX);
    },
    [setTimestampFromHoverCoordinate, isPlaying]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (isPlaying) return;
      const lastTouch = event.touches[event.touches.length - 1];
      setTimestampFromHoverCoordinate(lastTouch.clientX);
    },
    [isPlaying, setTimestampFromHoverCoordinate]
  );

  return (
    <div ref={elementRef} className="w-full cursor-crosshair relative">
      <div className="h-24">
        <AltitudeChart
          flightData={flightData}
          followFlightId={followFlightId}
        />
      </div>
      <div>
        {flightData.map((datum) => (
          <TaskTimeline
            key={datum.flight.id}
            flightDatum={datum}
            startAt={timelineStartAt}
            finishAt={timelineFinishAt}
          />
        ))}
      </div>

      <TimelineMarker
        timelineWidth={width}
        timelineStartAt={timelineStartAt}
        timelineFinishAt={timelineFinishAt}
        activeTimestamp={activeTimestamp}
        offset={followFlight.flight.offsetInMilliseconds}
      />

      <div
        className="w-full h-full absolute left-0 bottom-0"
        onClick={onClick}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      ></div>
    </div>
  );
}

function useComponentWidth(domElement: HTMLElement | null) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!domElement) return;

    const resizeObserver = new ResizeObserver(() => {
      setWidth(domElement.clientWidth);
    });
    resizeObserver.observe(domElement);

    return () => resizeObserver.unobserve(domElement);
  }, [domElement, setWidth]);

  return width;
}

function usePreventDragScroll(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const elm = elementRef.current;
    if (!elm) return;

    const preventDefault = (event: any) => {
      event.preventDefault();
    };

    elm.addEventListener("touchmove", preventDefault, {
      passive: false,
    });

    return () => elm.removeEventListener("touchmove", preventDefault);
  }, [elementRef]);
}

function TimelineMarker(props: {
  timelineWidth: number;
  timelineStartAt: Date;
  timelineFinishAt: Date;
  activeTimestamp: Date | null;
  offset: Quantity<Duration>;
}) {
  const {
    timelineWidth,
    timelineStartAt,
    timelineFinishAt,
    activeTimestamp,
    offset,
  } = props;

  if (!activeTimestamp) return null;

  const relativeLeftPosition = relativeTo(
    timelineStartAt,
    timelineFinishAt,
    activeTimestamp
  );
  const absoluteLeftPosition = relativeLeftPosition * timelineWidth;
  const detailsStyle =
    relativeLeftPosition > 0.5 ? { right: "-1px" } : { left: "-2px" };
  const displayTimestamp = revertTimestampOffset(activeTimestamp, offset);

  return (
    <div
      className="absolute w-0 h-full left-0 bottom-0 border-l-2 border-white border-dashed shadow"
      style={{
        transform: `translate(${absoluteLeftPosition - 1}px,0px)`,
        willChange: "transform",
      }}
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
