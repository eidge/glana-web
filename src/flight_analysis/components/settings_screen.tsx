import { synchronizationMethods } from "glana/src/analysis/flight_group";
import { Settings, UnitOption, units } from "../settings";
import { actions } from "../store/actions";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { useEffect, useState } from "react";
import analytics from "../../analytics";

export default function SettingsScreen() {
  const { settings } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const onChange = (changes: Partial<Settings>) => {
    dispatch(actions.changeSettings(changes));
  };

  useEffect(() => analytics.trackEvent("settings_opened"), []);

  return (
    <div>
      <div className="mt-4">
        <span className="text-gray-500">Units</span>
        <div className="mt-2">{unitInput(settings, onChange)}</div>
      </div>
      <div className="mt-4">
        <span className="text-gray-500">QNH</span>
        <div className="mt-2">{QNHInput(settings, onChange)}</div>
      </div>
      <div className="mt-4">
        <span className="text-gray-500">Synchronize flights by</span>
        <div className="mt-2">
          {synchronizationMethodInput(settings, onChange)}
        </div>
      </div>
      <div className="mt-4">
        <span className="text-gray-500">Playback speed</span>
        <div className="mt-2">{playbackSpeedInput(settings, onChange)}</div>
      </div>
      <div className="mt-4">
        <span className="text-gray-500">Map</span>
        <div className="mt-2">{renderFullTracksInput(settings, onChange)}</div>
        <div className="mt-2">
          {renderFollowFlightInput(settings, onChange)}
        </div>
        <div className="mt-2">{showAirspaceInput(settings, onChange)}</div>
        <div className="mt-2">{showWeatherInput(settings, onChange)}</div>
      </div>
    </div>
  );
}

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

function unitInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return unitOptions.map((option) => {
    return (
      <label className="inline-flex items-center mr-6" key={option.stringValue}>
        <input
          type="radio"
          name="unit"
          value={option.stringValue}
          checked={settings.units === option.value}
          onChange={() =>
            onChange({
              units: option.value,
            })
          }
        />
        <span className="ml-2">{option.label}</span>
      </label>
    );
  });
}

function QNHInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  const [qnh, setQNH] = useState(settings.qnh.value);
  const unitSettings = units[settings.units];
  const makeQNH = (qnhStr: string) => unitSettings.pressure(+qnhStr);
  const updateSettings = (event: { target: { value: string } }) => {
    const qnh = makeQNH(event.target.value);
    onChange({ qnh });
  };

  useEffect(() => setQNH(settings.qnh.value), [settings.qnh.value]);

  return (
    <>
      <label className="inline-flex items-center mr-6">
        <input
          type="number"
          className="bg-gray-700 px-2 rounded w-24"
          name="pressure"
          value={qnh}
          onChange={(event) => setQNH(+event.target.value)}
          onBlur={updateSettings}
        />
        <span className="ml-2">{unitSettings.pressure.unit.symbol}</span>
      </label>
    </>
  );
}

const synchronizationOptions = [
  {
    label: "Real-time",
    value: synchronizationMethods.realTime,
    stringValue: "realTime",
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

function synchronizationMethodInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return synchronizationOptions.map((option) => {
    return (
      <label className="inline-flex items-center mr-6" key={option.stringValue}>
        <input
          type="radio"
          name="synchronizationMethod"
          value={option.stringValue}
          checked={settings.synchronizationMethod === option.value}
          onChange={() =>
            onChange({
              synchronizationMethod: option.value,
            })
          }
        />
        <span className="ml-2">{option.label}</span>
      </label>
    );
  });
}

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

function playbackSpeedInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return playbackSpeedOptions.map((option) => {
    return (
      <label className="inline-flex items-center mr-6" key={option.stringValue}>
        <input
          type="radio"
          name="playbackSpeed"
          value={option.stringValue}
          checked={settings.playbackSpeed === option.value}
          onChange={() =>
            onChange({
              playbackSpeed: option.value,
            })
          }
        />
        <span className="ml-2">{option.label}</span>
      </label>
    );
  });
}

function renderFullTracksInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return (
    <label className="inline-flex items-center mr-6">
      <input
        type="checkbox"
        name="renderFullTracks"
        checked={settings.renderFullTracks}
        onChange={(event) =>
          onChange({
            renderFullTracks: event.target.checked,
          })
        }
      />
      <span className="ml-2">Show entire flight track</span>
    </label>
  );
}

function renderFollowFlightInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return (
    <label className="inline-flex items-center mr-6">
      <input
        type="checkbox"
        name="followFlight"
        checked={settings.followFlight}
        onChange={(event) =>
          onChange({
            followFlight: event.target.checked,
          })
        }
      />
      <span className="ml-2">Re-center map when flight leaves the screen</span>
    </label>
  );
}

function showAirspaceInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return (
    <label className="inline-flex items-center mr-6">
      <input
        type="checkbox"
        name="airspace"
        checked={settings.showAirspace}
        onChange={(event) =>
          onChange({
            showAirspace: event.target.checked,
          })
        }
      />
      <span className="ml-2">Show airspace</span>
    </label>
  );
}

function showWeatherInput(
  settings: Settings,
  onChange: (settings: Partial<Settings>) => void
) {
  return (
    <label className="inline-flex items-center mr-6">
      <input
        type="checkbox"
        name="weather"
        checked={settings.showWeather}
        onChange={(event) =>
          onChange({
            showWeather: event.target.checked,
          })
        }
      />
      <span className="ml-2">Show satpic</span>
    </label>
  );
}
