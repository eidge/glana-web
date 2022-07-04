import Task from "glana/src/flight_computer/tasks/task";
import SavedFlight from "glana/src/saved_flight";
import { Picture } from "../reducer";

export class FlightDatum {
  id: string;
  flight: SavedFlight;
  color: string;
  pictures: Picture[];

  constructor(savedFlight: SavedFlight) {
    this.id = savedFlight.id;
    this.flight = savedFlight;
    this.color = "#000000";
    this.pictures = [];
  }

  get task(): Task | null {
    return this.flight.task;
  }
}
