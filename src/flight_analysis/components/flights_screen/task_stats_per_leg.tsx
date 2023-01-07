import Task from "glana/src/flight_computer/tasks/task";
import { minutes } from "glana/src/units/duration";
import { kilometers } from "glana/src/units/length";
import FlightLabel from "../../../ui/components/flight_label";
import {
  Body,
  Cell,
  Head,
  HeadCell,
  HeadRow,
  Row,
  Table,
} from "../../../ui/components/table";
import { pluralize } from "../../../utils/human";
import { UnitSettings } from "../../settings";
import { FlightDatum } from "../../store/models/flight_datum";

interface Props {
  flightData: FlightDatum[];
  task: Task;
  unitSettings: UnitSettings;
  followFlightId: string;
}

export default function TaskStatsPerLeg(props: Props) {
  const { task, flightData, unitSettings, followFlightId } = props;

  return (
    <Table>
      <Head>
        <HeadRow>
          <HeadCell className="text-center" colSpan={3}>
            Per leg
          </HeadCell>
        </HeadRow>
      </Head>
      <Body>
        {task.turnpoints.map((turnpoint, idx) => (
          <>
            <Row key={`header-turnpoint-${idx}`}>
              <Cell className="text-center leading-none py-4" colSpan={3}>
                <strong>{turnpoint.name}</strong>
                <br />
                {idx !== task.turnpoints.length - 1 && (
                  <span className="text-xs">
                    {distanceToNextText(task, idx)} leg
                  </span>
                )}
              </Cell>
            </Row>
            {flightData.map((fd) => {
              const stats = fd.flight.taskStats?.statsFor(turnpoint);
              if (!stats) return <></>;

              return (
                <Row key={fd.id}>
                  <Cell className="leading-none">
                    <FlightLabel
                      flightDatum={fd}
                      isActive={fd.id === followFlightId}
                    />
                    <br />
                    <span className="text-xs leading-none inline-block py-2">
                      {stats.duration
                        .convertTo(minutes)
                        .round()
                        .toString({ precision: 0 })}{" "}
                      @ {stats.speed.toString()}
                    </span>
                  </Cell>
                  <Cell>
                    <div className="flex flex-row items-center justify-start">
                      <div className="flex flex-col text-xs font-hairline text-left">
                        <div>
                          {pluralize("thermal", stats.numberOfThermals)}
                        </div>
                        <div>
                          {stats.averageClimbRate
                            .convertTo(unitSettings.vario)
                            .toString({ alwaysShowSign: true })}{" "}
                          avg
                        </div>
                        <div>
                          {stats.totalClimb
                            .convertTo(unitSettings.altitude)
                            .toString({ alwaysShowSign: true })}{" "}
                          total
                        </div>
                      </div>
                    </div>
                  </Cell>
                  <Cell>
                    <div className="flex flex-row items-center justify-start">
                      <div className="flex flex-col text-xs font-hairline text-left">
                        <div>
                          {stats.totalGlideDistance
                            .convertTo(unitSettings.distance)
                            .toString()}{" "}
                          in {pluralize("glide", stats.numberOfGlides)}{" "}
                        </div>
                        <div>{stats.averageGlideAngle.toString()} L/D</div>
                        <div>
                          {stats.averageGlideSpeed
                            .convertTo(unitSettings.speed)
                            .toString()}{" "}
                          avg
                        </div>
                      </div>
                    </div>
                  </Cell>
                </Row>
              );
            })}
          </>
        ))}
      </Body>
    </Table>
  );
}

function distanceToNextText(task: Task, i: number) {
  if (i === task.turnpoints.length - 1) return "";

  const distance = distanceToNext(task, i).convertTo(kilometers).toString();
  return ` ${distance}`;
}

function distanceToNext(task: Task, i: number) {
  if (i === task.turnpoints.length - 1) return kilometers(0);

  const current = task.turnpoints[i];
  const next = task.turnpoints[i + 1];
  return current.center.distance2DTo(next.center);
}
