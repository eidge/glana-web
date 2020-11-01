import { Duration, milliseconds } from "glana/src/units/duration";
import { Length, meters } from "glana/src/units/length";
import Quantity from "glana/src/units/quantity";
import { metersPerSecond, Speed } from "glana/src/units/speed";
import { Component } from "react";

interface TimestampDetails {
  color: string;
  label: string;
  altitude: Quantity<Length> | null;
  vario: Quantity<Speed> | null;
  timestampOffset: Quantity<Duration>;
}

interface Props {
  activeTimestamp: Date;
  relativeLeftPosition: number;
  timestampDetails: TimestampDetails[];
}

interface State {}

export default class TimelineMarker extends Component<Props, State> {
  render() {
    return (
      <div
        className="absolute w-0 h-full bottom-0 border-l-2 border-white border-dashed shadow"
        style={{ left: `${this.props.relativeLeftPosition}%` }}
      >
        <div className={this.markerDetailsClassNames()}>
          {this.props.timestampDetails.map((d, i) => this.markerDetails(d, i))}
        </div>

        <style jsx>{`
          .marker-details {
            left: -2px;
          }

          .marker-details-right {
            left: -2px;
            right: auto;
          }

          .marker-details-left {
            left: auto;
            right: 0;
          }
        `}</style>
      </div>
    );
  }

  private markerDetailsClassNames() {
    let classes = [
      "absolute bottom-full marker-details bg-white py-2 px-3 rounded shadow",
    ];
    if (this.props.relativeLeftPosition > 50) {
      classes.push("marker-details-left");
    } else {
      classes.push("marker-details-right");
    }
    return classes.join(" ");
  }

  private markerDetails(details: TimestampDetails, index: number) {
    return (
      <div className="gl-marker-details" key={index}>
        <div className="gl-marker-details-label">
          <div
            className="gl-marker-details-dot"
            style={{ backgroundColor: details.color }}
          ></div>
          <div>{details.label}</div>
        </div>
        <div className="gl-marker-details-values">
          {this.maybeVario(details)}
          {this.maybeAltitude(details)}
          {this.timestamp(details)}
        </div>

        <style jsx>{`
          .gl-marker-details {
            @apply flex flex-row justify-between items-center;
          }

          .gl-marker-details-label {
            @apply flex flex-row items-center text-base w-16 font-semibold leading-none overflow-hidden mr-3;
          }

          .gl-marker-details-dot {
            @apply w-2 h-2 rounded-full mr-2;
          }

          .gl-marker-details-values {
            @apply flex flex-col text-right;
          }

          :global(.gl-marker-details) + :global(.gl-marker-details) {
            border-top: solid 1px #ddd;
            padding-top: 8px;
            margin-top: 8px;
          }
        `}</style>
      </div>
    );
  }

  private maybeVario(details: TimestampDetails) {
    if (!details.vario) return null;
    let color = details.vario.equalOrGreaterThan(metersPerSecond(0))
      ? "green"
      : "red";
    return (
      <div
        className="text-xs leading-none font-mono font-hairline"
        style={{ color: color }}
      >
        {details.vario.convertTo(metersPerSecond).toString()}
      </div>
    );
  }

  private maybeAltitude(details: TimestampDetails) {
    if (!details.altitude) return null;
    return (
      <div className="text-xs leading-none font-mono font-hairline mt-1">
        {details.altitude.convertTo(meters).toString()}
      </div>
    );
  }

  private timestamp(details: TimestampDetails) {
    let timestampInMillis = this.props.activeTimestamp.getTime();
    let offsetInMillis = details.timestampOffset.convertTo(milliseconds).value;
    let timestamp = new Date(timestampInMillis - offsetInMillis);
    let className = "leading-none text-sm font-mono";

    if (details.vario || details.altitude) {
      className += " mt-2";
    }

    return <div className={className}>{timestamp.toLocaleTimeString()}</div>;
  }
}
