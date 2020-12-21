import Phase from "glana/src/analysis/phases/phase";
import Thermal from "glana/src/analysis/phases/thermal";
import Glide from "glana/src/analysis/phases/glide";
import { meters } from "glana/src/units/length";
import Icon from "../../ui/icon";
import {
  Table,
  Head,
  HeadRow,
  HeadCell,
  Body,
  Row,
  Cell
} from "../../ui/table";
import { SettingsModel, units } from "../settings";
import Stop from "glana/src/analysis/phases/stop";
import React, { useEffect } from "react";
import analytics from "../../../analytics";

interface Props {
  phases: Phase[];
  onHoverPhase: (phase: Phase) => void;
  settings: SettingsModel;
}

function statsCell(
  mainValue: {} | null | undefined,
  secondary: {} | null | undefined,
  tertiary: {} | null | undefined
) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex-shrink-0 flex flex-row items-center">
        {mainValue}
      </div>
      <div className="flex flex-col text-xs font-hairline text-right">
        <div>{secondary}</div>
        <div>{tertiary}</div>
      </div>
    </div>
  );
}

// FIXME: Must not use any, but need to clean up the types to do so.
function thermalStats(thermal: Thermal, unitConfig: any) {
  const sign = thermal.altitudeGain.greaterThan(meters(0)) ? "+" : "";

  return statsCell(
    <>
      <Icon icon="thermal" size="md" className="mr-1 text-failure" />
      {thermal.climbRate.convertTo(unitConfig.vario).toString()}
    </>,
    <>
      {sign}
      {thermal.altitudeGain.convertTo(unitConfig.altitude).toString()}
    </>,
    thermal.finalAltitude.convertTo(unitConfig.altitude).toString()
  );
}

function glideStats(glide: Glide, unitConfig: any) {
  return statsCell(
    <>
      <Icon icon="glide" size="md" className="mr-1 text-success" />
      {glide.glideAngle.toString()}
    </>,
    glide.speed.convertTo(unitConfig.speed).toString(),
    glide.distance.convertTo(unitConfig.distance).toString()
  );
}

function phaseStats(phase: Phase, unitConfig: any) {
  if (phase instanceof Thermal) {
    return thermalStats(phase, unitConfig);
  } else if (phase instanceof Glide) {
    return glideStats(phase, unitConfig);
  } else if (phase instanceof Stop) {
    return <Icon icon="stop" size="md" />;
  } else {
    return null;
  }
}

function Phases(props: Props) {
  const unitConfig = units[props.settings.units];
  let { phases } = props;

  useEffect(() => analytics.trackEvent("viewed_stats_phases"), []);

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
            onMouseOver={() => props.onHoverPhase(phase)}
          >
            <Cell>{phase.startAt.toLocaleTimeString()}</Cell>
            <Cell className="hidden lg:table-cell">{phase.type}</Cell>
            <Cell>{phaseStats(phase, unitConfig)}</Cell>
          </Row>
        ))}
      </Body>
    </Table>
  );
}

export default React.memo(Phases);
