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
        className="marker"
        style={{ left: `${this.props.relativeLeftPosition}%` }}
      >
        <div className={this.markerDetailsClassNames()}>
          {this.props.timestampDetails.map((d, i) => this.markerDetails(d, i))}
        </div>

        <style jsx>{`
          .marker {
            position: absolute;
            width: 0px;
            height: 100%;
            bottom: 0;
            border-left: dashed 1px black;
          }

          .marker-details {
            position: absolute;
            bottom: 100%;
            left: -1px;
            background-color: white;
            padding: 5px 10px;
            border-radius: 4px;
          }

          .marker-details.marker-details-left {
            left: auto;
            right: -1px;
          }

          .marker-details-single {
            display: flex;
            flex-direction: row;
          }
        `}</style>
      </div>
    );
  }

  private markerDetailsClassNames() {
    let classes = ["marker-details"];
    if (this.props.relativeLeftPosition > 50) {
      classes.push("marker-details-left");
    }
    return classes.join(" ");
  }

  private markerDetails(details: TimestampDetails, index: number) {
    return (
      <div className="marker-details-single" key={index}>
        <div className="marker-details-label">
          <div
            className="marker-details-dot"
            style={{ backgroundColor: details.color }}
          ></div>
          <div>{details.label}</div>
        </div>
        <div className="marker-details-values">
          {this.maybeVario(details)}
          {this.maybeAltitude(details)}
          {this.timestamp(details)}
        </div>

        <style jsx>{`
          .marker-details-single {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
          }

          :global(.marker-details-single) + :global(.marker-details-single) {
            border-top: solid 1px #ddd;
          }

          .marker-details-label {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 60px;
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            overflow: hidden;
          }

          .marker-details-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
          }

          .marker-details-values {
            display: flex;
            flex-direction: column;
            text-align: right;
            min-width: 60px;
          }
        `}</style>
      </div>
    );
  }

  private maybeAltitude(details: TimestampDetails) {
    if (!details.altitude) return null;
    return (
      <div className="marker-details-altitude">
        {details.altitude.convertTo(meters).toString()}

        <style jsx>{`
          .marker-details-altitude {
            font-size: 12px;
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
      <div className="marker-details-vario" style={{ color: color }}>
        {details.vario.convertTo(metersPerSecond).toString()}

        <style jsx>{`
          .marker-details-vario {
            font-size: 10px;
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
      <div className="marker-details-timestamp">
        {timestamp.toLocaleTimeString()}

        <style jsx>{`
          .marker-details-timestamp {
            font-size: 12px;
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
