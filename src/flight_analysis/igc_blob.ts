import IGCParser from "glana/src/igc/parser";
import FlightGroup from "glana/src/analysis/flight_group";

export default class IGCBlob {
  private blobs: Blob[];

  constructor(blobs: Blob[]) {
    this.blobs = blobs;
  }

  async toFlightGroup() {
    let blobContents = await this.readBlobs(this.blobs);
    return this.parseIGCs(blobContents);
  }

  private readBlobs(blobs: Blob[]) {
    let fileContentPromises = blobs.map(file => this.readBlob(file as Blob));
    return Promise.all(fileContentPromises);
  }

  private readBlob(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = fileContents =>
        resolve(fileContents.target?.result as string);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

  private parseIGCs(blobContents: string[]) {
    let savedFlights = blobContents.map(contents => {
      let parser = new IGCParser();
      const flight = parser.parse(contents);
      return flight;
    });

    return new FlightGroup(savedFlights);
  }
}
