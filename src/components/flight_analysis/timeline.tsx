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
  activeTimestamp: Date;
  onTimestampChange: (timestamp: Date) => void;
}

interface State {}

export default class Timeline extends Component<Props, State> {
  containerEl: HTMLDivElement | null = null;

  render() {
    return (
      <div
        className="w-full absolute bottom-0 h-24"
        ref={(el) => (this.containerEl = el)}
        onMouseMove={(e) => this.onMouseMove(e)}
      >
        <AltitudeChart flightGroup={this.props.flightGroup} />
        <TimelineMarker
          activeTimestamp={this.props.activeTimestamp}
          relativeLeftPosition={this.relativeLeftPosition() * 100}
          timestampDetails={this.timestampDetails()}
        />
      </div>
    );
  }

  private relativeLeftPosition() {
    return (
      (this.props.activeTimestamp.getTime() - this.earliestDatum().getTime()) /
      (this.latestDatum().getTime() - this.earliestDatum().getTime())
    );
  }

  private onMouseMove(event: any) {
    if (!this.props.onTimestampChange || !this.containerEl) return;
    let relativePosition = this.calculateMouseRelativePositionLeft(
      this.containerEl,
      event
    );
    let timestampAtPosition = this.timestampAtRelativePosition(
      relativePosition
    );
    this.props.onTimestampChange(timestampAtPosition);
  }

  private calculateMouseRelativePositionLeft(
    container: HTMLElement,
    event: any
  ) {
    let containerRect = container.getBoundingClientRect();
    return (event.clientX - containerRect.left) / containerRect.width;
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
    return this.props.flightGroup.flights.map(
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
        };
      }
    );
  }
}
