import { synchronizationMethods } from "glana/src/analysis/flight_group";
import SynchronizationMethod from "glana/src/analysis/synchronization/method";
import { feet, meters } from "glana/src/units/length";
import { QuantityFactory } from "glana/src/units/quantity_factory";
import {
  kilometersPerHour,
  knots,
  metersPerSecond,
} from "glana/src/units/speed";
import Unit from "glana/src/units/unit";
import { Component } from "react";

const synchronizationOptions = [
  {
    label: "Real-time",
    value: synchronizationMethods.realTime,
    stringValue: "realTime",
  },
  {
    label: "Recording started",
    value: synchronizationMethods.recordingStarted,
    stringValue: "recordingStarted",
  },
  {
    label: "Takeoff time",
    value: synchronizationMethods.takeOff,
    stringValue: "takeoffTime",
  },
  {
    label: "Task started",
    value: synchronizationMethods.taskStarted,
    stringValue: "taskStarted",
  },
];

const playbackSpeedOptions = [
  {
    label: "10x",
    value: 10,
    stringValue: "10",
  },
  {
    label: "25x",
    value: 25,
    stringValue: "25",
  },
  {
    label: "50x",
    value: 50,
    stringValue: "50",
  },
  {
    label: "100x",
    value: 100,
    stringValue: "100",
  },
  {
    label: "250x",
    value: 250,
    stringValue: "250",
  },
  {
    label: "500x",
    value: 500,
    stringValue: "500",
  },
  {
    label: "1000x",
    value: 1000,
    stringValue: "1000",
  },
];

type UnitOption = "metric" | "imperial";

const unitOptions = [
  {
    label: "Imperial",
    value: "imperial" as UnitOption,
    stringValue: "imperial",
  },
  {
    label: "Metric",
    value: "metric" as UnitOption,
    stringValue: "metric",
  },
];

export const units = {
  metric: {
    vario: metersPerSecond,
    altitude: meters,
    speed: kilometersPerHour,
  },
  imperial: {
    vario: knots,
    altitude: feet,
    speed: knots,
  },
};

export interface SettingsModel {
  synchronizationMethod: SynchronizationMethod;
  renderFullTracks: boolean;
  followFlight: boolean;
  playbackSpeed: number;
  units: UnitOption;
}

interface Props {
  settings: SettingsModel;
  onChange: (model: SettingsModel) => void;
}

interface State {
  settings: SettingsModel;
}

export default class Settings extends Component<Props, State> {
  render() {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-4">Settings</h1>
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
          <span className="text-gray-700">Flight track</span>
          <div className="mt-2">{this.renderFullTracksInput()}</div>
          <div className="mt-2">{this.renderFollowFlightInput()}</div>
        </div>
      </div>
    );
  }

  private unitInput() {
    return unitOptions.map((option) => {
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
              this.props.onChange({
                ...this.props.settings,
                units: option.value,
              })
            }
          />
          <span className="ml-2">{option.label}</span>
        </label>
      );
    });
  }

  private synchronizationMethodInput() {
    return synchronizationOptions.map((option) => {
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
              this.props.onChange({
                ...this.props.settings,
                synchronizationMethod: option.value,
              })
            }
          />
          <span className="ml-2">{option.label}</span>
        </label>
      );
    });
  }

  playbackSpeedInput() {
    return playbackSpeedOptions.map((option) => {
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
              this.props.onChange({
                ...this.props.settings,
                playbackSpeed: option.value,
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
          onChange={(event) =>
            this.props.onChange({
              ...this.props.settings,
              renderFullTracks: event.target.checked,
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
          onChange={(event) =>
            this.props.onChange({
              ...this.props.settings,
              followFlight: event.target.checked,
            })
          }
        />
        <span className="ml-2">
          Re-center map when flight leaves the screen
        </span>
      </label>
    );
  }
}
