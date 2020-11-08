import React, { Component } from "react";

import FlightGroup from "glana/src/analysis/flight_group";
import AltitudeChart from "./altitude_chart";
import TimelineMarker from "./timeline_marker";
import { COLORS } from "../../maps/flight_renderer";
import SavedFlight from "glana/src/saved_flight";
import Quantity from "glana/src/units/quantity";
import { Speed } from "glana/src/units/speed";

interface Props {
  flightGroup: FlightGroup;
  followFlight: SavedFlight;
  activeTimestamp: Date;
  onTimestampChange: (timestamp: Date) => void;
  setFollowFlight: (flight: SavedFlight) => void;
}

interface State {}

export default class Timeline extends Component<Props, State> {
  containerEl: HTMLDivElement | null = null;

  render() {
    return (
      <div className="w-full absolute bottom-0 h-24 cursor-default select-none">
        <AltitudeChart flightGroup={this.props.flightGroup} />
        <TimelineMarker
          activeTimestamp={this.props.activeTimestamp}
          relativeLeftPosition={this.relativeLeftPosition() * 100}
          timestampDetails={this.timestampDetails()}
        />
        <div
          className="w-full h-full absolute bottom-0 left-0 cursor-crosshair"
          ref={(el) => (this.containerEl = el)}
          onMouseMove={(e) => this.onMouseMove(e)}
          onTouchMove={(e) => this.onTouchMove(e)}
        ></div>
      </div>
    );
  }

  private relativeLeftPosition() {
    let relativeValue =
      (this.props.activeTimestamp.getTime() - this.earliestDatum().getTime()) /
      (this.latestDatum().getTime() - this.earliestDatum().getTime());

    if (relativeValue < 0) return 0;
    if (relativeValue > 1) return 1;
    return relativeValue;
  }

  private onMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    event.stopPropagation();
    this.updateCurrentTimestamp(event.clientX);
  }

  private onTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const lastTouch = event.touches[event.touches.length - 1];
    this.updateCurrentTimestamp(lastTouch.clientX);
  }

  private updateCurrentTimestamp(mouseOverX: number) {
    if (!this.props.onTimestampChange || !this.containerEl) return;
    let relativePosition = this.calculateMouseRelativePositionLeft(
      this.containerEl,
      mouseOverX
    );
    let timestampAtPosition = this.timestampAtRelativePosition(
      relativePosition
    );
    this.props.onTimestampChange(timestampAtPosition);
  }

  private calculateMouseRelativePositionLeft(
    container: HTMLElement,
    clientX: number
  ) {
    let containerRect = container.getBoundingClientRect();
    return (clientX - containerRect.left) / containerRect.width;
  }

  private timestampAtRelativePosition(relativePosition: number) {
    let flightDurationInMillis =
      this.latestDatum().getTime() - this.earliestDatum().getTime();
    let ellapsedTimeAtPosition = flightDurationInMillis * relativePosition;
    return new Date(this.earliestDatum().getTime() + ellapsedTimeAtPosition);
  }

  private earliestDatum() {
    return this.props.flightGroup.flights
      .map((f) => f.getRecordingStartedAt())
      .sort()[0];
  }

  private latestDatum() {
    let flights = this.props.flightGroup.flights;
    return flights.map((f) => f.getRecordingStoppedAt()).sort()[
      flights.length - 1
    ];
  }

  private timestampDetails() {
    return this.flightsSortedByEarliestStart().map(
      (f: SavedFlight, index: number) => {
        let datum = f.datumAt(this.props.activeTimestamp);
        return {
          color: COLORS.getColorFor(f),
          label: f.metadata.callsign || f.metadata.registration || `#${index}`,
          altitude: datum?.position.altitude || null,
          vario:
            (datum?.calculatedValues["averageVario"] as Quantity<Speed>) ||
            null,
          timestampOffset: f.getTimeOffsetInMilliseconds(),
          isActive: this.props.followFlight === f,
          onClick: () => {
            this.props.setFollowFlight(f);
          },
        };
      }
    );
  }

  private flightsSortedByEarliestStart() {
    return this.props.flightGroup.flights.sort(
      (f1: SavedFlight, f2: SavedFlight) =>
        f1.getRecordingStartedAt(true).getTime() -
        f2.getRecordingStartedAt(true).getTime()
    );
  }
}
