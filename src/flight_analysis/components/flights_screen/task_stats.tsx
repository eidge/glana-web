import { minutes } from "glana/src/units/duration";
import { kilometersPerHour } from "glana/src/units/speed";
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
  unitSettings: UnitSettings;
  followFlightId: string;
}

export default function TaskStats(props: Props) {
  const { flightData, unitSettings, followFlightId } = props;

  return (
    <Table>
      <Head>
        <HeadRow>
          <HeadCell className="text-center" colSpan={3}>
            Summary
          </HeadCell>
        </HeadRow>
      </Head>
      <Body>
        {flightData.map((fd) => {
          const stats = fd.flight.taskStats?.stats();

          if (!stats) {
            return (
              <Row key={fd.id}>
                <Cell className="leading-none">
                  <FlightLabel
                    flightDatum={fd}
                    isActive={fd.id === followFlightId}
                  />
                </Cell>
                <Cell className="leading-none">
                  <span className="text-xs leading-none inline-block py-2 text-left">
                    did not finish
                  </span>
                </Cell>
                <Cell className="leading-none"> </Cell>
              </Row>
            );
          }

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
                  @ {stats.speed.convertTo(kilometersPerHour).toString()}
                </span>
              </Cell>
              <Cell>
                <div className="flex flex-row items-center justify-start">
                  <div className="flex flex-col text-xs font-hairline text-left">
                    <div>{pluralize("thermal", stats.numberOfThermals)}</div>
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
      </Body>
    </Table>
  );
}
