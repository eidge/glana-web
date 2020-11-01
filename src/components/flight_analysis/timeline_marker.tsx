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
        className="absolute w-0 h-full bottom-0 border-l-2 border-white border-dashed"
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
      "absolute bottom-full marker-details bg-white py-2 px-3 rounded",
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
      <div
        className="gl-marker-details-single"
        data-other="flex flex-row justify-between items-center"
        key={index}
      >
        <div className="flex flex-row items-center text-base w-16 font-medium leading-none overflow-hidden mr-3">
          <div
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: details.color }}
          ></div>
          <div>{details.label}</div>
        </div>
        <div className="flex flex-col text-right ">
          {this.maybeVario(details)}
          {this.maybeAltitude(details)}
          {this.timestamp(details)}
        </div>

        <style jsx>{`
          :global(.gl-marker-details-single)
            + :global(.gl-marker-details-single) {
            @apply flex flex-row justify-between items-center;
            border-top: solid 1px #ddd;
            padding-top: 8px;
            margin-top: 8px;
          }
        `}</style>
      </div>
    );
  }

  private maybeAltitude(details: TimestampDetails) {
    if (!details.altitude) return null;
    return (
      <div className="marker-details-altitude text-xs">
        {details.altitude.convertTo(meters).toString()}

        <style jsx>{`
          .marker-details-altitude {
            //font-size: 12px;
            line-height: 1;
            margin-top: 2px;
            font-family: monospace;
            text-align: right;
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
      <div className="marker-details-vario text-xs" style={{ color: color }}>
        {details.vario.convertTo(metersPerSecond).toString()}

        <style jsx>{`
          .marker-details-vario {
            //font-size: 10px;
            line-height: 1;
            font-family: monospace;
            text-align: right;
          }
        `}</style>
      </div>
    );
  }

  private timestamp(details: TimestampDetails) {
    let timestampInMillis = this.props.activeTimestamp.getTime();
    let offsetInMillis = details.timestampOffset.convertTo(milliseconds).value;
    let timestamp = new Date(timestampInMillis - offsetInMillis);

    return (
      <div className="marker-details-timestamp text-sm">
        {timestamp.toLocaleTimeString()}

        <style jsx>{`
          .marker-details-timestamp {
            //font-size: 12px;
            line-height: 1;
            margin-top: 2px;
            font-family: monospace;
            text-align: right;
            margin-top: 5px;
          }
        `}</style>
      </div>
    );
  }
}
