import Phase from "glana/src/analysis/phases/phase";
import SavedFlight from "glana/src/saved_flight";
import Phases from "./phases";
import FlightSummary from "./flight_summary";
import { ButtonProps } from "../../ui/button";
import FlightLabel from "../../ui/flight_label";
import FlightGroup from "glana/src/analysis/flight_group";
import { useCallback, useState } from "react";
import { SettingsModel } from "../settings";
import React from "react";
import ButtonGroup from "../../ui/button_group";
import { GliderState } from "glana/src/flight_computer/state_machine";

interface Props {
  followFlight: SavedFlight;
  flightGroup: FlightGroup;
  settings: SettingsModel;
  onTimestampChange: (timestamp: Date) => void;
  setFollowFlight: (flight: SavedFlight) => void;
}

type Tab = "Summary" | "Phases" | "More";

const tabLink = (
  tab: Tab,
  activeTab: Tab,
  onClick: (tab: Tab) => void,
  isComing: boolean = false
) => {
  const classNames = ["p-1 relative text-lg"];
  if (tab === activeTab) classNames.push("border-b-2 border-primary font-bold");
  if (isComing) classNames.push("cursor-not-allowed");

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      className={classNames.join(" ")}
      href="#"
      onClick={() => !isComing && onClick(tab)}
    >
      {tab}
      {isComing && (
        <div className="coming-soon animate-pulse">
          <span className="animate-pulse">soon</span>
        </div>
      )}
      <style jsx>{`
        .coming-soon {
          @apply font-normal text-primary animate-pulse;
          position: absolute;
          right: -15px;
          bottom: 80%;
          font-size: 10px;
          line-height: 1;
        }
      `}</style>
    </a>
  );
};

function flightButtons(
  flights: SavedFlight[],
  followFlight: SavedFlight,
  selectFlight: { (flight: SavedFlight): () => void }
): ButtonProps[] {
  return flights.map(flight => {
    const isActive = flight === followFlight;
    return {
      isActive,
      color: "white",
      onClick: selectFlight(flight),
      children: (
        <FlightLabel isActive={isActive} flight={flight} isCompact={false} />
      )
    };
  });
}

function Stats(props: Props) {
  const { onTimestampChange, setFollowFlight, followFlight } = props;
  const [tab, setTab] = useState<Tab>("Summary");
  const setTimestampFromPhase = useCallback(
    (phase: Phase) => {
      onTimestampChange(phase.finishAt);
    },
    [onTimestampChange]
  );
  const selectFlight = useCallback(
    (flight: SavedFlight) => {
      return () => setFollowFlight(flight);
    },
    [setFollowFlight]
  );
  const [phaseFilter, setPhaseFilter] = useState<GliderState | null>(null);
  const setPhaseFilterFn = useCallback(
    phase => () => setPhaseFilter(phase),
    []
  );

  let phases = followFlight.phases;
  if (phaseFilter) {
    phases = phases.filter(phase => phase.type === phaseFilter);
  }

  return (
    <div className="my-6">
      <div className="mb-6 space-x-6 w-full">
        {tabLink("Summary", tab, setTab)}
        {tabLink("Phases", tab, setTab)}
        {tabLink("More", tab, setTab, true)}
      </div>

      <div className="space-y-6">
        {tab === "Summary" && (
          <div className="pt-3 space-y-6">
            {props.flightGroup.flights.map(flight => (
              <FlightSummary
                key={flight.id}
                flight={flight}
                isActive={flight === props.followFlight}
              />
            ))}
          </div>
        )}

        {tab === "Phases" && (
          <>
            <div>
              {props.flightGroup.flights.length > 1 && (
                <ButtonGroup
                  className="mr-3 mt-3"
                  buttons={flightButtons(
                    props.flightGroup.flights,
                    followFlight,
                    selectFlight
                  )}
                />
              )}

              <ButtonGroup
                className="mt-3"
                buttons={[
                  {
                    color: "white",
                    children: "show all",
                    isActive: phaseFilter === null,
                    onClick: setPhaseFilterFn(null)
                  },
                  {
                    color: "white",
                    icon: "thermal",
                    children: "thermals",
                    isActive: phaseFilter === "thermalling",
                    onClick: setPhaseFilterFn("thermalling")
                  },
                  {
                    color: "white",
                    icon: "glide",
                    children: "glides",
                    onClick: setPhaseFilterFn("gliding"),
                    isActive: phaseFilter === "gliding"
                  }
                ]}
              />
            </div>

            <Phases
              settings={props.settings}
              phases={phases}
              onHoverPhase={setTimestampFromPhase}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default React.memo(Stats);
