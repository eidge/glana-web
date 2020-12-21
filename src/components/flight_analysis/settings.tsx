import { synchronizationMethods } from "glana/src/analysis/flight_group";
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import { feet, kilometers, meters } from "glana/src/units/length";
import {
  kilometersPerHour,
  knots,
  metersPerSecond
} from "glana/src/units/speed";
import { Component } from "react";
import analytics from "../../analytics";

const synchronizationOptions = [
  {
    label: "Real-time",
    value: synchronizationMethods.realTime,
    stringValue: "realTime"
  },
  {
    label: "Recording started",
    value: synchronizationMethods.recordingStarted,
    stringValue: "recordingStarted"
  },
  {
    label: "Takeoff time",
    value: synchronizationMethods.takeOff,
    stringValue: "takeoffTime"
  },
  {
    label: "Task started",
    value: synchronizationMethods.taskStarted,
    stringValue: "taskStarted"
  }
];

const playbackSpeedOptions = [
  {
    label: "10x",
    value: 10,
    stringValue: "10"
  },
  {
    label: "25x",
    value: 25,
    stringValue: "25"
  },
  {
    label: "50x",
    value: 50,
    stringValue: "50"
  },
  {
    label: "100x",
    value: 100,
    stringValue: "100"
  },
  {
    label: "250x",
    value: 250,
    stringValue: "250"
  },
  {
    label: "500x",
    value: 500,
    stringValue: "500"
  },
  {
    label: "1000x",
    value: 1000,
    stringValue: "1000"
  }
];

type UnitOption = "metric" | "imperial";

const unitOptions = [
  {
    label: "Imperial",
    value: "imperial" as UnitOption,
    stringValue: "imperial"
  },
  {
    label: "Metric",
    value: "metric" as UnitOption,
    stringValue: "metric"
  }
];

export const units = {
  metric: {
    vario: metersPerSecond,
    altitude: meters,
    speed: kilometersPerHour,
    distance: kilometers
  },
  imperial: {
    vario: knots,
    altitude: feet,
    speed: knots,
    distance: kilometers
  }
};

export interface SettingsModel {
  synchronizationMethod: SynchronizationMethod;
  renderFullTracks: boolean;
  followFlight: boolean;
  playbackSpeed: number;
  units: UnitOption;
  showAirspace: boolean;
}

interface Props {
  settings: SettingsModel;
  onChange: (model: SettingsModel) => void;
}

interface State {
  settings: SettingsModel;
}

export default class Settings extends Component<Props, State> {
  componentDidMount() {
    analytics.trackEvent("settings_opened");
  }

  render() {
    return (
      <div>
        <div className="mt-4">
          <span className="text-gray-700">Units</span>
          <div className="mt-2">{this.unitInput()}</div>
        </div>
        <div className="mt-4">
          <span className="text-gray-700">Synchronize flights by</span>
          <div className="mt-2">{this.synchronizationMethodInput()}</div>
        </div>
        <div className="mt-4">
          <span className="text-gray-700">Playback speed</span>
          <div className="mt-2">{this.playbackSpeedInput()}</div>
        </div>
        <div className="mt-4">
          <span className="text-gray-700">Map</span>
          <div className="mt-2">{this.renderFullTracksInput()}</div>
          <div className="mt-2">{this.renderFollowFlightInput()}</div>
          <div className="mt-2">{this.showAirspaceInput()}</div>
        </div>
      </div>
    );
  }

  private unitInput() {
    return unitOptions.map(option => {
      return (
        <label
          className="inline-flex items-center mr-6"
          key={option.stringValue}
        >
          <input
            type="radio"
            name="unit"
            value={option.stringValue}
            checked={this.props.settings.units === option.value}
            onChange={() =>
              this.onChange({
                units: option.value
              })
            }
          />
          <span className="ml-2">{option.label}</span>
        </label>
      );
    });
  }

  private onChange(changes: Partial<SettingsModel>) {
    const attribute = Object.keys(changes)[0];
    const value = Object.values(changes)[0];
    analytics.trackEvent("settings_changed", {
      attribute,
      value
    });
    this.props.onChange({
      ...this.props.settings,
      ...changes
    });
  }

  private synchronizationMethodInput() {
    return synchronizationOptions.map(option => {
      return (
        <label
          className="inline-flex items-center mr-6"
          key={option.stringValue}
        >
          <input
            type="radio"
            name="synchronizationMethod"
            value={option.stringValue}
            checked={this.props.settings.synchronizationMethod === option.value}
            onChange={() =>
              this.onChange({
                synchronizationMethod: option.value
              })
            }
          />
          <span className="ml-2">{option.label}</span>
        </label>
      );
    });
  }

  playbackSpeedInput() {
    return playbackSpeedOptions.map(option => {
      return (
        <label
          className="inline-flex items-center mr-6"
          key={option.stringValue}
        >
          <input
            type="radio"
            name="playbackSpeed"
            value={option.stringValue}
            checked={this.props.settings.playbackSpeed === option.value}
            onChange={() =>
              this.onChange({
                playbackSpeed: option.value
              })
            }
          />
          <span className="ml-2">{option.label}</span>
        </label>
      );
    });
  }

  private renderFullTracksInput() {
    return (
      <label className="inline-flex items-center mr-6">
        <input
          type="checkbox"
          name="renderFullTracks"
          checked={this.props.settings.renderFullTracks}
          onChange={event =>
            this.onChange({
              renderFullTracks: event.target.checked
            })
          }
        />
        <span className="ml-2">Show entire flight track</span>
      </label>
    );
  }

  private renderFollowFlightInput() {
    return (
      <label className="inline-flex items-center mr-6">
        <input
          type="checkbox"
          name="followFlight"
          checked={this.props.settings.followFlight}
          onChange={event =>
            this.onChange({
              followFlight: event.target.checked
            })
          }
        />
        <span className="ml-2">
          Re-center map when flight leaves the screen
        </span>
      </label>
    );
  }

  private showAirspaceInput() {
    return (
      <label className="inline-flex items-center mr-6">
        <input
          type="checkbox"
          name="followFlight"
          checked={this.props.settings.showAirspace}
          onChange={event =>
            this.onChange({
              showAirspace: event.target.checked
            })
          }
        />
        <span className="ml-2">Show airspace</span>
      </label>
    );
  }
}
