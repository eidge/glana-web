import { Duration, milliseconds } from "glana/src/units/duration";
import { Length } from "glana/src/units/length";
import Quantity from "glana/src/units/quantity";
import { knots, Speed } from "glana/src/units/speed";
import { Component } from "react";
import { SettingsModel, units } from "./settings";

interface TimestampDetails {
  color: string;
  label: string;
  altitude: Quantity<Length> | null;
  vario: Quantity<Speed> | null;
  timestampOffset: Quantity<Duration>;
  isActive: boolean;
  onClick: () => void;
}

interface Props {
  activeTimestamp: Date;
  relativeLeftPosition: number;
  timestampDetails: TimestampDetails[];
  settings: SettingsModel;
  isCompact: boolean;
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
          {this.props.isCompact && (
            <div className="text-xs leading-none font-mono font-hairline text-center py-1">
              {this.offsetTimestamp(
                this.props.timestampDetails.find((td) => td.isActive)!
              ).toLocaleTimeString()}
            </div>
          )}
          {this.props.timestampDetails.map((d) => this.markerDetails(d))}
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
      "absolute bottom-full marker-details bg-white px-3 rounded shadow divide-y",
    ];
    if (this.props.relativeLeftPosition > 50) {
      classes.push("marker-details-left");
    } else {
      classes.push("marker-details-right");
    }
    return classes.join(" ");
  }

  private markerDetails(details: TimestampDetails) {
    return (
      <div className="py-2" key={details.label}>
        <div className="gl-marker-details-clickable" onClick={details.onClick}>
          <div
            className={
              this.props.isCompact
                ? "gl-marker-details-label gl-marker-details-label-compact"
                : "gl-marker-details-label"
            }
          >
            <div
              className="gl-marker-details-dot"
              style={{
                backgroundColor: details.isActive
                  ? details.color
                  : "transparent",
                borderColor: details.color,
              }}
            ></div>
            <div className="overflow-hidden">{details.label}</div>
          </div>
          <div className="gl-marker-details-values">
            {this.maybeRenderVario(details)}
            {this.maybeRenderAltitude(details)}
            {this.maybeRenderTimestamp(details)}
          </div>

          <style jsx>{`
            .gl-marker-details-clickable {
              @apply flex flex-row justify-between items-center rounded cursor-pointer;
            }

            .gl-marker-details-clickable:hover {
              @apply bg-gray-200;
            }

            .gl-marker-details-label {
              @apply flex flex-row items-center text-base w-20 font-semibold leading-none overflow-hidden mr-3;
            }

            .gl-marker-details-label-compact {
              @apply text-sm;
            }

            .gl-marker-details-dot {
              @apply w-2 h-2 rounded-full mr-2 flex-shrink-0 border-2;
            }

            .gl-marker-details-values {
              @apply flex flex-col text-right;
            }
          `}</style>
        </div>
      </div>
    );
  }

  private maybeRenderVario(details: TimestampDetails) {
    if (this.props.isCompact || !details.vario) return null;
    let color = details.vario.equalOrGreaterThan(knots(0)) ? "green" : "red";
    return (
      <div
        className="text-xs leading-none font-mono font-hairline"
        style={{ color: color }}
      >
        {details.vario.convertTo(this.unitConfig().vario).toString()}
      </div>
    );
  }

  private unitConfig() {
    return units[this.props.settings.units];
  }

  private maybeRenderAltitude(details: TimestampDetails) {
    if (!details.altitude) return null;
    let classes = "text-xs leading-none font-mono font-hairline";

    if (!this.props.isCompact) {
      classes += " mt-1";
    }

    return (
      <div className={classes}>
        {details.altitude.convertTo(this.unitConfig().altitude).toString()}
      </div>
    );
  }

  private maybeRenderTimestamp(details: TimestampDetails) {
    if (this.props.isCompact) return null;

    let timestamp = this.offsetTimestamp(details);
    let className = "leading-none text-sm font-mono";

    if (details.vario || details.altitude) {
      className += " mt-2";
    }

    return <div className={className}>{timestamp.toLocaleTimeString()}</div>;
  }

  private offsetTimestamp(details: TimestampDetails) {
    let timestampInMillis = this.props.activeTimestamp.getTime();
    let offsetInMillis = details.timestampOffset.convertTo(milliseconds).value;
    return new Date(timestampInMillis - offsetInMillis);
  }
}
