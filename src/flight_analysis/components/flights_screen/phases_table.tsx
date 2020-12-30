import Phase from "glana/src/analysis/phases/phase";
import React, { ReactNode } from "react";
import { UnitSettings } from "../../settings";
import {
  Table,
  Head,
  HeadRow,
  HeadCell,
  Body,
  Row,
  Cell
} from "../../../ui/components/table";
import Icon from "../../../ui/components/icon";
import Thermal from "glana/src/analysis/phases/thermal";
import Glide from "glana/src/analysis/phases/glide";
import Stop from "glana/src/analysis/phases/stop";

interface Props {
  unitSettings: UnitSettings;
  phases: Phase[];
  onSelectPhase: (phase: Phase) => void;
}

function PhasesTable(props: Props) {
  const { phases, onSelectPhase, unitSettings } = props;

  return (
    <Table>
      <Head>
        <HeadRow>
          <HeadCell className="">Time</HeadCell>
          <HeadCell className="hidden lg:table-cell">Phase</HeadCell>
          <HeadCell>Stats</HeadCell>
        </HeadRow>
      </Head>
      <Body>
        {phases.map(phase => (
          <Row
            key={phase.startAt.getTime()}
            onClick={() => onSelectPhase(phase)}
          >
            <Cell>{phase.startAt.toLocaleTimeString()}</Cell>
            <Cell className="hidden lg:table-cell">{phase.type}</Cell>
            <Cell>{phaseStats(phase, unitSettings)}</Cell>
          </Row>
        ))}
      </Body>
    </Table>
  );
}

export default React.memo(PhasesTable);

function phaseStats(phase: Phase, unitSettings: UnitSettings) {
  if (phase instanceof Thermal) {
    return <ThermalStats phase={phase} unitSettings={unitSettings} />;
  } else if (phase instanceof Glide) {
    return <GlideStats phase={phase} unitSettings={unitSettings} />;
  } else if (phase instanceof Stop) {
    return <Icon icon="stop" size="md" />;
  } else {
    return null;
  }
}

function ThermalStats(props: { phase: Thermal; unitSettings: UnitSettings }) {
  const { phase, unitSettings } = props;
  const sign = phase.altitudeGain.greaterThan(unitSettings.altitude(0))
    ? "+"
    : "";

  return (
    <StatsCell
      mainValue={
        <>
          <Icon className="mr-1 text-failure" icon="thermal" size="md" />
          {phase.climbRate.convertTo(unitSettings.vario).toString()}
        </>
      }
      secondaryValue={
        <>
          {sign}
          {phase.altitudeGain.convertTo(unitSettings.altitude).toString()}
        </>
      }
      tertiaryValue={phase.finalAltitude
        .convertTo(unitSettings.altitude)
        .toString()}
    />
  );
}

function GlideStats(props: { phase: Glide; unitSettings: UnitSettings }) {
  const { phase, unitSettings } = props;

  return (
    <StatsCell
      mainValue={
        <>
          <Icon className="mr-1 text-success" icon="glide" size="md" />
          {phase.glideAngle.toString()}
        </>
      }
      secondaryValue={phase.speed.convertTo(unitSettings.speed).toString()}
      tertiaryValue={phase.distance.convertTo(unitSettings.distance).toString()}
    />
  );
}

function StatsCell(props: {
  mainValue: ReactNode;
  secondaryValue: ReactNode;
  tertiaryValue: ReactNode;
}) {
  const { mainValue, secondaryValue, tertiaryValue } = props;
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex-shrink-0 flex flex-row items-center">
        {mainValue}
      </div>
      <div className="flex flex-col text-xs font-hairline text-right">
        <div>{secondaryValue}</div>
        <div>{tertiaryValue}</div>
      </div>
    </div>
  );
}
