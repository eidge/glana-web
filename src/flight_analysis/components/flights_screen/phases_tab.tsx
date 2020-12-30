import ButtonGroup from "../../../ui/components/button_group";
import { FlightDataById, FlightDatum } from "../../store/reducer";
import FlightLabel from "../../../ui/components/flight_label";
import { GliderState } from "glana/src/flight_computer/state_machine";
import { useEffect, useMemo, useState } from "react";
import analytics from "../../../analytics";
import PhasesTable from "./phases_table";
import React from "react";
import { UnitSettings } from "../../settings";
import Phase from "glana/src/analysis/phases/phase";

interface Props {
  flightData: FlightDatum[];
  flightDataById: FlightDataById;
  followFlightId: string;
  onSelectFlight: (fd: FlightDatum) => void;
  setActiveTimestamp: (ts: Date) => void;
  unitSettings: UnitSettings;
}

type PhaseFilterOption = GliderState | null;

function PhasesTab(props: Props) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilterOption>(null);
  useEffect(() => analytics.trackEvent("viewed_stats_phases"), []);

  const {
    followFlightId,
    flightDataById,
    unitSettings,
    setActiveTimestamp
  } = props;
  const followFlightData = flightDataById[followFlightId];
  const phases = followFlightData.flight.phases;
  const onSelectPhase = (phase: Phase) => {
    setActiveTimestamp(phase.finishAt);
  };

  const filteredPhases = useMemo(() => {
    if (!phaseFilter) return phases;
    return phases.filter(p => p.type === phaseFilter);
  }, [phases, phaseFilter]);

  return (
    <div className="space-y-3">
      <div className="inline-flex flex-row flex-wrap leading-none mb-3 sm:mb-0">
        <div className="mr-3 mb-3">
          <FlightFilter {...props} />
        </div>
        <div>
          <PhaseFilter filter={phaseFilter} setFilter={setPhaseFilter} />
        </div>
      </div>
      <PhasesTable
        phases={filteredPhases}
        onSelectPhase={onSelectPhase}
        unitSettings={unitSettings}
      />
    </div>
  );
}

export default React.memo(PhasesTab);

function FlightFilter(props: Props) {
  const { flightData, followFlightId, onSelectFlight } = props;
  const buttons = flightData.map(flightDatum => {
    const isActive = flightDatum.id === followFlightId;
    return {
      children: <FlightLabel flightDatum={flightDatum} isActive={isActive} />,
      onClick: () => {
        onSelectFlight(flightDatum);
      },
      isPressed: isActive
    };
  });
  return <ButtonGroup size="md" color="white" type="full" buttons={buttons} />;
}

function PhaseFilter(props: {
  filter: PhaseFilterOption;
  setFilter: (filter: PhaseFilterOption) => void;
}) {
  const { filter, setFilter } = props;

  return (
    <ButtonGroup
      size="md"
      color="white"
      type="full"
      buttons={[
        {
          text: "show all",
          isPressed: filter === null,
          onClick: () => setFilter(null)
        },
        {
          icon: "thermal",
          text: "thermals",
          isPressed: filter === "thermalling",
          onClick: () => setFilter("thermalling")
        },
        {
          icon: "glide",
          text: "glides",
          isPressed: filter === "gliding",
          onClick: () => setFilter("gliding")
        }
      ]}
    />
  );
}
