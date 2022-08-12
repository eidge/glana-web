import Task from "glana/src/flight_computer/tasks/task";
import SavedFlight from "glana/src/saved_flight";

export type Picture = {
  title: string | null;
  url: string;
  takenAt: Date;
};

type FlightDatumExtraData = {
  pictures?: Picture[];
};

export class FlightDatum {
  id: string;
  flight: SavedFlight;
  color: string;
  pictures: Picture[];

  constructor(savedFlight: SavedFlight, extra: FlightDatumExtraData = {}) {
    this.id = savedFlight.id;
    this.flight = savedFlight;
    this.color = "#000000";
    this.pictures = extra.pictures || [];
  }

  get task(): Task | null {
    return this.flight.task;
  }
}
